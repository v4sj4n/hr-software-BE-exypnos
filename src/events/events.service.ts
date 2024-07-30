import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '../common/schema/event.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private notificationService: NotificationService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const createdEvent = new this.eventModel(createEventDto);
      if (!createdEvent) {
        throw new InternalServerErrorException('Event could not be created');
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
      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        id,
        updateEventDto,
        { new: true },
      );
      if (!updatedEvent) {
        throw new NotFoundException(`Event with id ${id} not found`);
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
}
