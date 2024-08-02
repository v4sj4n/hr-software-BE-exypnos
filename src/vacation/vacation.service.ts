import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { User } from 'src/common/schema/user.schema';
import { Vacation } from 'src/common/schema/vacation.schema';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';
import {
  compareDates,
  formatDate,
  isDateRangeOverlapping,
} from '../common/util/dateUtil';
import { paginate } from 'src/common/util/paginate';

@Injectable()
export class VacationService {
  constructor(
    @InjectModel(Vacation.name) private vacationModel: Model<Vacation>,
    private notificationService: NotificationService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    try {
      await this.checkUserId(createVacationDto.userId);
      await this.checkDatesforCreate(createVacationDto);
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

  async findAll() {
    try {
      return await this.vacationModel
        .find({ isDeleted: false })
        .populate('userId', 'firstName lastName');
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAllPaginate(page:number,limit:number): Promise<any> {
    return paginate(page, limit, this.vacationModel);
   }

  async findOne(id: string) {
    try {
      const vacation = await this.vacationModel
        .findById(id)
        .populate('userId', 'firstName lastName');
      if (!vacation || vacation.isDeleted) {
        throw new NotFoundException(`Vacation with id ${id} not found`);
      }
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
        await this.checkUserId(updateVacationDto.userId);
      }
      if (updateVacationDto.startDate || updateVacationDto.endDate) {
        await this.checkDatesforUpdate(updateVacationDto, id);
      }
      const updatedVacation = await this.vacationModel.findByIdAndUpdate(
        id,
        {
          ...updateVacationDto,
        },
        { new: true },
      );
      await this.notificationService.createNotification(
        'Vacation Request Update',
        `Vacation request from ${updateVacationDto.startDate} to ${updateVacationDto.endDate}`,
        NotificationType.VACATION,
        updatedVacation._id,
        new Date(),
      );
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

  private async checkUserId(userId: Types.ObjectId) {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }
  private async checkDatesforUpdate(
    updateVacationDto: UpdateVacationDto,
    id: string,
  ) {
    const existingVacation = await this.vacationModel.findById(id);
    if (!existingVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }

    const startDate = updateVacationDto.startDate
      ? formatDate(new Date(updateVacationDto.startDate))
      : formatDate(new Date(existingVacation.startDate));
    const endDate = updateVacationDto.endDate
      ? formatDate(new Date(updateVacationDto.endDate))
      : formatDate(new Date(existingVacation.endDate));
    const today = formatDate(new Date());

    if (compareDates(startDate, today) <= 0) {
      throw new ConflictException(
        `Start date ${startDate} must be greater than today ${today}`,
      );
    }

    if (compareDates(endDate, startDate) < 0) {
      throw new ConflictException(
        `End date ${endDate} must be greater than start date ${startDate}`,
      );
    }

    const conflictingVacation = await this.vacationModel.aggregate([
      {
        $match: {
          userId: existingVacation.userId,
          endDate: { $gt: new Date() },
        },
      },
      {
        $sort: { endDate: -1 },
      },
    ]);

    for (const vacation of conflictingVacation) {
      const vacationStart = formatDate(new Date(vacation.startDate));
      const vacationEnd = formatDate(new Date(vacation.endDate));

      if (
        vacation._id.toString() !== id &&
        isDateRangeOverlapping(startDate, endDate, vacationStart, vacationEnd)
      ) {
        throw new ConflictException(
          `New vacation conflicts with an existing vacation from ${vacationStart} to ${vacationEnd}`,
        );
      }
    }
  }
  private async checkDatesforCreate(
    vacationData: CreateVacationDto | UpdateVacationDto,
  ) {
    const startDate = formatDate(new Date(vacationData.startDate));
    const endDate = formatDate(new Date(vacationData.endDate));
    const today = formatDate(new Date());

    if (compareDates(startDate, today) <= 0) {
      throw new ConflictException(
        `Start date ${startDate} must be greater than today ${today}`,
      );
    }

    if (compareDates(endDate, startDate) < 0) {
      throw new ConflictException(
        `End date ${endDate} must be greater than start date ${startDate}`,
      );
    }

    const conflictingVacation = await this.vacationModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(vacationData.userId),
        },
      },
    ]);

    for (const vacation of conflictingVacation) {
      const vacationStart = formatDate(new Date(vacation.startDate));
      const vacationEnd = formatDate(new Date(vacation.endDate));

      if (
        isDateRangeOverlapping(startDate, endDate, vacationStart, vacationEnd)
      ) {
        throw new ConflictException(
          `New vacation conflicts with an existing vacation from ${vacationStart} to ${vacationEnd}`,
        );
      }
    }
  }
}
