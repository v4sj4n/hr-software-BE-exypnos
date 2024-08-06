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
import { Event, Poll, PollOption } from '../common/schema/event.schema';
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
      if (createEventDto.poll) {
        this.validatePollData(createEventDto.poll);
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
        this.validatePollData(updateEventDto.poll);
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
    const user = await this.userModel.findById(vote.userId);

    for (const option of event.poll.options) {
      if (
        option.voters.some(
          (voter) =>
            voter._id.toString() === user._id.toString() &&
            voter.firstName === user.firstName &&
            voter.lastName === user.lastName,
        ) &&
        !event.poll.isMultipleVote
      ) {
        throw new ConflictException('User has already voted for an option');
      }
    }

    const option = event.poll.options.find((opt) => opt.option === vote.option);
    if (
      option.voters.some(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      )
    ) {
      throw new ConflictException('User has already voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': 1 },
        $addToSet: {
          'poll.options.$.voters': {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
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
    const user = await this.userModel.findById(vote.userId);

    if (
      !option.voters.some(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      )
    ) {
      throw new ConflictException('User has not voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': -1 },
        $pull: {
          'poll.options.$.voters': {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
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
    if (!event.poll || !event.poll.options) {
      throw new BadRequestException('This event does not have a poll');
    }
    return event.poll.options;
  }

  async getptionThatUserVotedFor(id: string, userId: string): Promise<number> {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (!event.poll || !event.poll.options) {
      throw new BadRequestException('This event does not have a poll');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const votedOption = event.poll.options.find((opt) =>
      opt.voters.some(
        (voter) =>
          voter._id.toString() === userId &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      ),
    );
    return votedOption ? event.poll.options.indexOf(votedOption) + 1 : -1;
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

  private validatePollData(poll: Poll) {
    if (poll.question.length === 0) {
      throw new BadRequestException('Poll question cannot be empty');
    }
    if (poll.options.length <= 1) {
      throw new BadRequestException('Poll options must be more than one');
    }
    if (poll.options.length > 3) {
      throw new BadRequestException('Poll options must be 3 or 2');
    }
    if (poll.options.some((opt) => opt.option.length <= 1)) {
      throw new BadRequestException(
        'Poll option cannot be less than 1 character',
      );
    }
    for (let i = 0; i < poll.options.length; i++) {
      for (let j = i + 1; j < poll.options.length; j++) {
        if (poll.options[i].option === poll.options[j].option) {
          throw new BadRequestException('Poll options must be unique');
        }
      }
    }
  }
}
