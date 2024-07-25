import { Injectable, NotFoundException } from '@nestjs/common';
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
    return createdNotification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find({ isDeleted: false });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification || notification.isDeleted) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }
  async updateNotification(
    title: string,
    content: string,
    type: NotificationType,
    typeId: Types.ObjectId,
    date: Date,
    isDeleted: boolean,
  ): Promise<Notification> {
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
  }
}
