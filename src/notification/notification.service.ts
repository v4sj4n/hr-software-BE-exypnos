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
import { User } from 'src/common/schema/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createNotification(
    title: string,
    content: string,
    type: NotificationType,
    date: Date,
    typeId?: Types.ObjectId,
  ): Promise<Notification> {
    try {
      const createNotificationDto: CreateNotificationDto = {
        title,
        content,
        type,
        typeId: typeId || new Types.ObjectId(),
        isRead: false,
        date,
      };
      const createdNotification = new this.notificationModel(
        createNotificationDto,
      );
      return createdNotification.save();
    } catch (error) {
      throw new ConflictException(
        'Failed to create notification',
        error.message,
      );
    }
  }

  async findAll(): Promise<Notification[]> {
    try {
      return this.notificationModel.find({ isDeleted: false });
    } catch (error) {
      throw new ConflictException(
        'Failed to fetch notifications',
        error.message,
      );
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(
        'Failed to fetch notification',
        error.message,
      );
    }
  }

  async update(id: string): Promise<Notification> {
    try {
      const updatedNotification = await this.notificationModel.findOneAndUpdate(
        { _id: id },
        { isRead: true },
        { new: true },
      );

      if (!updatedNotification) {
        throw new NotFoundException('Notification not found');
      }

      return updatedNotification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(
        'Failed to update notification',
        error.message,
      );
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(
        'Failed to update notification',
        error.message,
      );
    }
  }

  async getNotificationsByUserId(
    id: string,
    period: string = 'today',
  ): Promise<Notification[]> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { startDate, endDate } = this.getDateRange(period);
      const userObjectId = new Types.ObjectId(id);

      const notifications = await this.getBaseNotifications(
        userObjectId,
        startDate,
        endDate,
      );
      const applicantNotifications = await this.getNotificationsOfApplicants(
        user,
        startDate,
        endDate,
      );
      const vacationNotifications = await this.getNotificationOfVacation(
        user._id,
        startDate,
        endDate,
      );

      const allNotifications = [
        ...notifications,
        ...applicantNotifications,
        ...vacationNotifications,
      ];
      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
      return allNotifications;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to get notifications', error.message);
    }
  }

  private getDateRange(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);

    if (period === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    }

    return { startDate, endDate };
  }

  private async getBaseNotifications(
    userObjectId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<Notification[]> {
    return this.notificationModel.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'typeId',
          foreignField: '_id',
          as: 'eventInfo',
        },
      },
      {
        $lookup: {
          from: 'notes',
          localField: 'typeId',
          foreignField: '_id',
          as: 'noteInfo',
        },
      },
      {
        $match: {
          $or: [
            {
              $or: [
                { 'eventInfo.participants': { $size: 0 } },
                { 'eventInfo.participants': userObjectId },
              ],
            },
            { 'noteInfo.userId': userObjectId },
          ],
          isDeleted: false,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          eventInfo: 0,
          noteInfo: 0,
        },
      },
    ]);
  }

  private async getNotificationsOfApplicants(
    user: User,
    startDate: Date,
    endDate: Date,
  ): Promise<Notification[]> {
    if (user.role !== 'hr') {
      return [];
    }

    const notifications = await this.notificationModel
      .find({
        type: NotificationType.APPLICANT,
        isDeleted: false,
        date: { $gte: startDate, $lt: endDate },
      })
      .sort({ date: -1 });
    return notifications;
  }

  private async getNotificationOfVacation(
    userId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<Notification[]> {
    const user = await this.userModel.findById(userId);
    if (user.role === 'hr') {
      const notifications = await this.notificationModel
        .find({
          type: NotificationType.VACATION,
          title: 'On Leave Request',
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate },
        })
        .sort({ date: -1 });

      return notifications;
    } else {
      return this.notificationModel.aggregate([
        {
          $lookup: {
            from: 'vacations',
            localField: 'typeId',
            foreignField: '_id',
            as: 'vacationInfo',
          },
        },
        {
          $match: {
            'vacationInfo.userId': userId,
            title: { $ne: 'On Leave Request' },
            isDeleted: false,
            date: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $project: {
            vacationInfo: 0,
          },
        },
      ]);
    }
  }
}
