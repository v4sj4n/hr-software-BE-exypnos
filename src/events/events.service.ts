import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, PollOption } from '../common/schema/event.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';
import { User } from 'src/common/schema/user.schema';
import { VoteDto } from './dto/vote.dto';
import { compareDates, formatDate } from 'src/common/util/dateUtil';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
    private notificationService: NotificationService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const createdEvent = new this.eventModel(createEventDto);
      if (!createdEvent) {
        throw new InternalServerErrorException('Event could not be created');
      }
      if (
        compareDates(formatDate(new Date()), formatDate(createdEvent.date)) >= 1
      ) {
        throw new BadRequestException('Event date cannot be in the past');
      }
      if (createdEvent.poll) {
        createdEvent.poll.options.forEach((opt) => {
          opt.votes = 0;
          opt.voters = [];
        });
      }
      await this.notificationService.createNotification(
        'Event Created',
        `Event ${createEventDto.title} has been created`,
        NotificationType.EVENT,
        createdEvent._id as Types.ObjectId,
        new Date(),
      );
      return await createdEvent.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(): Promise<Event[]> {
    try {
      return this.eventModel.find({ isDeleted: false });
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string): Promise<Event> {
    try {
      const event = await this.eventModel.findById(id);
      if (!event || event.isDeleted) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      return event;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    try {
      const existingEvent = await this.eventModel.findById(id);
      if (!existingEvent) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }

      if (!existingEvent.poll && updateEventDto.poll) {
        updateEventDto.poll.options = updateEventDto.poll.options.map(
          (opt) => ({
            ...opt,
            votes: 0,
            voters: [],
          }),
        );
      }

      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        id,
        { ...updateEventDto },
        { new: true, runValidators: true },
      );

      if (
        compareDates(formatDate(new Date()), formatDate(updatedEvent.date)) >= 1
      ) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      await this.notificationService.createNotification(
        'Event Updated',
        `Event ${updatedEvent.title} has been updated`,
        NotificationType.EVENT,
        updatedEvent._id as Types.ObjectId,
        new Date(),
      );

      return updatedEvent;
    } catch (error) {
      throw new ConflictException(error);
    }
  }
  async remove(id: string): Promise<void> {
    try {
      const result = await this.eventModel.findById(id);
      if (!result) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      await this.eventModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      await this.notificationService.createNotification(
        'Event Deleted',
        `Event ${result.title} has been deleted`,
        NotificationType.EVENT,
        result._id as Types.ObjectId,
        new Date(),
      );
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async addVote(id: string, vote: VoteDto): Promise<Event> {
    await this.validateData(id, vote);
    const event = await this.eventModel.findById(id);

    for (const option of event.poll.options) {
      if (option.voters.includes(vote.userId) && !event.poll.isMultipleVote) {
        throw new ConflictException('User has already voted for an option');
      }
    }

    const option = event.poll.options.find((opt) => opt.option === vote.option);
    if (option.voters.includes(vote.userId)) {
      throw new ConflictException('User has already voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': 1 },
        $addToSet: { 'poll.options.$.voters': vote.userId },
      },
      { new: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with id ${id} or option not found`);
    }

    return updatedEvent;
  }

  async removeVote(id: string, vote: VoteDto): Promise<Event> {
    await this.validateData(id, vote);
    const event = await this.eventModel.findById(id);
    const option = event.poll.options.find((opt) => opt.option === vote.option);

    if (!option.voters.includes(vote.userId)) {
      throw new ConflictException('User has not voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': -1 },
        $pull: { 'poll.options.$.voters': vote.userId },
      },
      { new: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with id ${id} or option not found`);
    }

    return updatedEvent;
  }

  async getEventPollResults(id: string): Promise<PollOption[]> {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event.poll.options;
  }

  private async validateData(id: string, vote: VoteDto): Promise<void> {
    const event = await this.eventModel.findById(
      id as unknown as Types.ObjectId,
    );

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (compareDates(formatDate(new Date()), formatDate(event.date)) >= 1) {
      throw new BadRequestException('Event date has passed');
    }

    const user = await this.userModel.findById(vote.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${vote.userId} not found`);
    }

    if (!event.poll || !event.poll.options) {
      throw new BadRequestException('This event does not have a poll');
    }
  }
}
