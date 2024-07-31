import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../common/schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from 'src/common/enum/notification.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(
    title: string,
    content: string,
    type: NotificationType,
    typeId: Types.ObjectId,
    date: Date,
  ): Promise<Notification> {
    try {
      const createNotificationDto: CreateNotificationDto = {
        title,
        content,
        type,
        typeId,
        date,
      };
      const createdNotification = new this.notificationModel(
        createNotificationDto,
      );
      console.log(createdNotification);
      return createdNotification.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(): Promise<Notification[]> {
    try {
      return this.notificationModel.find({ isDeleted: false });
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string): Promise<Notification> {
    try {
      const notification = await this.notificationModel.findById(id);
      if (!notification || notification.isDeleted) {
        throw new NotFoundException('Notification not found');
      }
      return notification;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async updateNotification(
    title: string,
    content: string,
    type: NotificationType,
    typeId: Types.ObjectId,
    date: Date,
    isDeleted: boolean,
  ): Promise<Notification> {
    try {
      const updatedNotification = await this.notificationModel.findOneAndUpdate(
        { type, typeId },
        { title, content, date, isDeleted },
        { new: true },
      );

      if (!updatedNotification) {
        throw new NotFoundException(
          `Notification for ${type} with id ${typeId} not found`,
        );
      }

      return updatedNotification;
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
