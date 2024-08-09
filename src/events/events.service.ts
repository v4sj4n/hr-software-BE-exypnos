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
import { FirebaseService } from 'src/firebase/firebase.service';
import { Auth } from 'src/common/schema/auth.schema';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private notificationService: NotificationService,
    private readonly firebaseService: FirebaseService,
    private readonly mailService: MailService,
  ) {}

  async create(
    files: Express.Multer.File[],
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    try {
      let eventPhotos: string[] = [];
      if (files && files.length > 0) {
        eventPhotos = await Promise.all(
          files.map(async (file) => {
            return await this.firebaseService.uploadFile(file, 'eventPhoto');
          }),
        );
      }
      const createdEvent = new this.eventModel({
        ...createEventDto,
        photo: eventPhotos,
      });

      if (!createdEvent) {
        throw new InternalServerErrorException('Event could not be created');
      }

      if (!createdEvent.participants || createdEvent.participants.length === 0) {
        createdEvent.participants = await this.populateParticipants();
      }
      if(!createdEvent.endDate){
        createdEvent.endDate = createdEvent.startDate;
        this.validateDate(createdEvent.startDate, createdEvent.endDate);
      }

      if (createdEvent.poll) {
        this.validatePollData(createdEvent.poll);
        createdEvent.poll.options.forEach((opt) => {
          opt.votes = 0;
          opt.voters = [];
        });
      }
      await this.notificationService.createNotification(
        'Event Created',
        `Event ${createdEvent.title} has been created`,
        NotificationType.EVENT,
        createdEvent._id as Types.ObjectId,
        new Date(),
      );
      await this.mailService.sendMail({
        to: createdEvent.participants,
        subject: `${createdEvent.title} - ${createdEvent.type}`,
        template: './event',
        context: {
          name: `${createdEvent.description}`,
        },
      });
      return await createdEvent.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(): Promise<Event[]> {
    try {
      return this.eventModel
        .find({ isDeleted: false })
        .populate('participants', 'firstName lastName');
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

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    photos?: Express.Multer.File[],
  ): Promise<Event> {
    try {
      let eventPhotos: string[] = [];
      if (photos) {
        eventPhotos = await Promise.all(
          photos.map(async (photo) => {
            return await this.firebaseService.uploadFile(photo, 'eventPhoto');
          }),
        );
      }
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
        { ...updateEventDto, photo: eventPhotos },
        { new: true, runValidators: true },
      );

      this.validateDate(updatedEvent.startDate, updatedEvent.endDate);
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
      var existingVoter = option.voters.find(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      );
      if (existingVoter) {
        var existingVote = option.option;
      }
    }
    if (existingVote && !event.poll.isMultipleVote) {
      await this.eventModel.findOneAndUpdate(
        { _id: id, 'poll.options.option': existingVote },
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

  async geOtptionThatUserVotedFor(id: string, userId: string): Promise<number> {
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
    if (
      compareDates(formatDate(new Date()), formatDate(event.startDate)) >= 1
    ) {
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
    if (poll.isMultipleVote === undefined) {
      poll.isMultipleVote = false;
    }
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

  private async populateParticipants() {
    let emails: string[] = [];
    let users = await this.userModel.find();
    let userIds = users.map((user) => user._id);
    for (const userId of userIds) {
      const user = await this.userModel
        .findById(userId)
        .populate('auth', 'email')
        .select('auth');
      const auth = await this.authModel.findById(user.auth);
      emails.push(auth.email);
    }
    return emails;
  }
  private validateDate(startDate: Date, endDate?: Date): void {

    if (compareDates(formatDate(startDate), formatDate(endDate)) >= 1) {
      throw new BadRequestException(
        'End date must be after or same start date',
      );
    }
    if (compareDates(formatDate(new Date()), formatDate(startDate)) >= 1) {
      throw new BadRequestException('Event date has passed');
    }
  }
}
