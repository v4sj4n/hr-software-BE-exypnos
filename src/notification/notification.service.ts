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
import { paginate } from 'src/common/util/pagination';

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
        typeId: typeId ? typeId : new Types.ObjectId(),
        isRead: false,
        date,
      };
      const createdNotification = new this.notificationModel(
        createNotificationDto,
      );
      return createdNotification.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  allVacation = this.createNotification(
    'You have more than 5 vacation requests',
    'Please check your notifications',
    NotificationType.ALLAPPLICATION,
    new Date(),
  );
  allApplication = this.createNotification(
    'You have more than 5 application requests',
    'Please check your notifications',
    NotificationType.ALLVACATION,
    new Date(),
  );

  async findAll(page: number, limit: number): Promise<Notification[]> {
    try {
      if (!limit && !page) {
        return await this.notificationModel
          .find({ isDeleted: { $ne: true } })
          .sort({ date: -1 });
      } else {
        return await paginate(
          page,
          limit,
          this.notificationModel,
          {},
          { date: -1 },
        );
      }
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

  async getNotificationsByUserId(
    id: string,
    isRead?: boolean,
  ): Promise<Notification[]> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userObjectId = new Types.ObjectId(id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const notifications = await this.notificationModel.aggregate([
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
                  {
                    'eventInfo.participants': {
                      $elemMatch: { $eq: userObjectId },
                    },
                  },
                ],
              },
              { 'noteInfo.userId': userObjectId },
            ],
            isDeleted: false,
            date: { $gte: today },
            isRead: isRead ? isRead : false,
          },
        },
        {
          $project: {
            eventInfo: 0,
            noteInfo: 0,
          },
        },
      ]);
      const applicantsNotifications = await this.getNotificationsOfApplicants(
        id,
        isRead,
      );
      const vacationNotifications = await this.getNotificationOfVacation(
        id,
        isRead,
      );

      return notifications
        .concat(applicantsNotifications)
        .concat(vacationNotifications);
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  private async getNotificationsOfApplicants(
    userId: string,
    isRead?: boolean,
  ): Promise<Notification[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let notifications = [];
      if (user.role === 'hr') {
        notifications = await this.notificationModel
          .find({
            type: NotificationType.APPLICANT,
            isDeleted: false,
            isRead: isRead ? isRead : false,
          })
          .sort({ date: -1 });
      }
      if (user.role === 'hr' && notifications.length > 5) {
        for (let i = 0; i < notifications.length; i++) {
          notifications[i].isRead = true;
          await notifications[i].save();
        }
        return [await this.allApplication];
      } else {
        return notifications;
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  private async getNotificationOfVacation(
    userId: string,
    isRead?: boolean,
  ): Promise<Notification[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let notifications = [];
      if (user.role === 'hr') {
        notifications = await this.notificationModel
          .find({
            type: NotificationType.VACATION,
            title: 'Vacation Request',
            isDeleted: false,
            isRead: false,
          })
          .sort({ date: -1 });
      } else {
        notifications = await this.notificationModel.aggregate([
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
              'vacationInfo.userId': new Types.ObjectId(userId),
              title: { $ne: 'Vacation Request' },
              isDeleted: false,
              isRead: isRead ? isRead : false,
            },
          },
          {
            $project: {
              vacationInfo: 0,
            },
          },
        ]);
      }
      if (user.role === 'hr' && notifications.length > 5) {
        for (let i = 0; i < notifications.length; i++) {
          notifications[i].isRead = true;
          await notifications[i].save();
        }
        return [await this.allVacation];
      } else {
        return notifications;
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
