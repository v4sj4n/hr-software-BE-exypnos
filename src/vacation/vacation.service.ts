import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, PipelineStage } from 'mongoose';
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
import { aggregatePaginate, paginate } from 'src/common/util/pagination';

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
    page: number,
    limit: number,
    type?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {
      const filter: any = { isDeleted: false };

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (startDate && endDate) {
        filter.startDate = { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        };
      }

      const populate = { path: 'userId', select: 'firstName lastName' };
      return paginate(page, limit, this.vacationModel, filter, {}, populate);
    } catch (error) {
      console.error('Error in findAll method:', error);
      throw new ConflictException('An error occurred while fetching vacation data');
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

  async getAllUserVacation(page:number,limit:number,search: string, users: string): Promise<User[]> {
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
      const aggregationPipeline: PipelineStage[] = [
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
      ];

      return  aggregatePaginate(page, limit, this.userModel, aggregationPipeline);
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
        throw new NotFoundException(`This user has no vacation requests`);
      }

      return userWithVacation[0];
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
