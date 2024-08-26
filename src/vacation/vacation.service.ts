import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { User } from 'src/common/schema/user.schema';
import { Vacation } from 'src/common/schema/vacation.schema';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';
import {
  checkUserId,
  checkDatesforUpdate,
  checkDatesforCreate,
} from './vacation.utils';
import { VacationStatus } from 'src/common/enum/vacation.enum';

@Injectable()
export class VacationService {
  constructor(
    @InjectModel(Vacation.name) private vacationModel: Model<Vacation>,
    private notificationService: NotificationService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    try {
      await checkUserId(this.userModel, createVacationDto.userId);
      await checkDatesforCreate(this.vacationModel, createVacationDto);
      const createdVacation = new this.vacationModel(createVacationDto);
      createdVacation.userId = new mongoose.Types.ObjectId(
        createVacationDto.userId,
      );
      await this.notificationService.createNotification(
        'Vacation Request',
        `Vacation request from ${createVacationDto.startDate} to ${createVacationDto.endDate}`,
        NotificationType.VACATION,
        createdVacation._id,
        new Date(),
      );
      return await createdVacation.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(
    type: string,
    status: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      if (type) {
        return await this.vacationModel
          .find({ isDeleted: false, type: type })
          .populate('userId', 'firstName lastName');
      }
      if (status) {
        return await this.vacationModel
          .find({ isDeleted: false, status: status })
          .populate('userId', 'firstName lastName');
      }
      if (startDate && endDate) {
        return await this.vacationModel
          .find({
            isDeleted: false,
            startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          })
          .populate('userId', 'firstName lastName');
      }
      return await this.vacationModel
        .find({ isDeleted: false })
        .populate('userId', 'firstName lastName');
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string) {
    try {
      const vacation = await this.vacationModel
        .findById(id)
        .populate('userId', 'firstName lastName');
      return vacation;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async update(id: string, updateVacationDto: UpdateVacationDto) {
    try {
      const exsistingVacation = await this.vacationModel.findById(id);
      if (!exsistingVacation) {
        throw new NotFoundException(`Vacation with id ${id} not found`);
      }
      if (updateVacationDto.userId) {
        await checkUserId(this.userModel, updateVacationDto.userId);
      }
      if (updateVacationDto.startDate || updateVacationDto.endDate) {
        await checkDatesforUpdate(this.vacationModel, updateVacationDto, id);
      }
      const updatedVacation = await this.vacationModel.findByIdAndUpdate(
        id,
        {
          ...updateVacationDto,
        },
        { new: true },
      );
      if (
        updateVacationDto.status === VacationStatus.ACCEPTED ||
        updateVacationDto.status === VacationStatus.REJECTED
      ) {
        await this.notificationService.createNotification(
          `Vacation request is ${updateVacationDto.status}.`,
          `Vacation request from ${updatedVacation.startDate} to ${updatedVacation.endDate} has been updated`,
          NotificationType.VACATION,
          updatedVacation._id,
          new Date(),
        );
      }
      return updatedVacation;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async remove(id: string) {
    try {
      const vacation = await this.vacationModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      if (!vacation) {
        throw new NotFoundException(`Vacation with id ${id} not found`);
      }
      await this.notificationService.createNotification(
        'Vacation Request Deleted',
        `Vacation request from ${vacation.startDate} to ${vacation.endDate} has been deleted`,
        NotificationType.VACATION,
        vacation._id,
        new Date(),
      );
      return vacation;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async getAllUserVacation(search: string, users: string): Promise<User[]> {
    let objectToPassToMatch: FilterQuery<any> =
      users === 'with'
        ? {
            vacations: { $ne: [] },
          }
        : users === 'without'
          ? {
              vacations: { $eq: [] },
            }
          : {};

    if (search) {
      objectToPassToMatch = {
        ...objectToPassToMatch,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    try {
      const userWithVacation = await this.userModel.aggregate([
        {
          $lookup: {
            from: 'vacations',
            localField: '_id',
            foreignField: 'userId',
            as: 'vacations',
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'auth',
            foreignField: '_id',
            as: 'authData',
          },
        },
        {
          $unwind: {
            path: '$authData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...objectToPassToMatch,
          },
        },
        {
          $sort: {
            firstName: 1,
            lastName: 1,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            imageUrl: 1,
            phone: 1,
            vacations: 1,
            role: 1,
            email: '$authData.email',
          },
        },
      ]);

      return userWithVacation;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getUserVacation(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      throw new ConflictException(`User with id ${id} not found`);
    }

    try {
      const userWithVacation = await this.userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'vacations',
            localField: '_id',
            foreignField: 'userId',
            as: 'vacations',
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'auth',
            foreignField: '_id',
            as: 'authData',
          },
        },
        {
          $unwind: {
            path: '$authData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            role: 1,
            imageUrl: 1,
            email: '$authData.email',
            phone: 1,
            vacations: 1,
          },
        },
      ]);

      if (userWithVacation.length === 0) {
        console.log('userWithVacation', userWithVacation);
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return userWithVacation[0];
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
