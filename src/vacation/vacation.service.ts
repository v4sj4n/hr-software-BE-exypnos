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
import {
  compareDates,
  formatDate,
  isDateRangeOverlapping,
} from '../common/util/dateUtil';

@Injectable()
export class VacationService {
  constructor(
    @InjectModel(Vacation.name) private vacationModel: Model<Vacation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    await this.checkUserId(createVacationDto.userId);
    await this.checkDatesforCreate(createVacationDto);
    const createdVacation = new this.vacationModel(createVacationDto);
    createdVacation.userId = new mongoose.Types.ObjectId(
      createVacationDto.userId,
    );
    return await createdVacation.save();
  }

  async findAll() {
    return await this.vacationModel.find({ isDeleted: false });
  }

  async findOne(id: string) {
    const vacation = await this.vacationModel.findById(id);
    if (!vacation || vacation.isDeleted) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    return vacation;
  }

  async update(id: string, updateVacationDto: UpdateVacationDto) {
    if (updateVacationDto.userId) {
      await this.checkUserId(updateVacationDto.userId);
    }
    await this.checkDatesforUpdate(updateVacationDto, id);
    const updatedVacation = await this.vacationModel.findByIdAndUpdate(
      id,
      {
        ...updateVacationDto,
        userId: new mongoose.Types.ObjectId(updateVacationDto.userId),
      },
      { new: true },
    );
    if (!updatedVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    return updatedVacation;
  }

  async remove(id: string) {
    const vacation = await this.vacationModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!vacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    return vacation;
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

    const startDate = formatDate(new Date(updateVacationDto.startDate));
    const endDate = formatDate(new Date(updateVacationDto.endDate));
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
