import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../common/schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
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
  ): Promise<Notification> {
    const createNotificationDto: CreateNotificationDto = {
      title,
      content,
      type,
      typeId,
      date: new Date(),
    };
    const createdNotification = new this.notificationModel(
      createNotificationDto,
    );
    return createdNotification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().exec();
  }

  async findOne(id: string): Promise<Notification> {
    return this.notificationModel.findById(id).exec();
  }
  async updateNotification(
    type: NotificationType,
    typeId: Types.ObjectId,
    title: string,
    content: string,
  ): Promise<Notification> {
    const updatedNotification = await this.notificationModel.findOneAndUpdate(
      { type, typeId },
      { title, content, date: new Date() },
      { new: true },
    );

    if (!updatedNotification) {
      throw new NotFoundException(
        `Notification for ${type} with id ${typeId} not found`,
      );
    }

    return updatedNotification;
  }

  async delete(id: string): Promise<Notification> {
    return this.notificationModel.findByIdAndDelete(id).exec();
  }
}
