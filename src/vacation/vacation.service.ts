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
    return await this.vacationModel.find();
  }

  async findOne(id: string) {
    const vacation = await this.vacationModel.findById(id);
    if (!vacation) {
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
    const deletedVacation = await this.vacationModel.findByIdAndDelete(id);
    if (!deletedVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    return deletedVacation;
  }

  private async checkUserId(userId: Types.ObjectId) {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private compareDates(date1: string, date2: string): number {
    const [year1, month1, day1] = date1.split('-').map(Number);
    const [year2, month2, day2] = date2.split('-').map(Number);

    if (year1 !== year2) return year1 - year2;
    if (month1 !== month2) return month1 - month2;
    return day1 - day2;
  }

  private isDateRangeOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return (
      this.compareDates(start1, end2) <= 0 &&
      this.compareDates(start2, end1) <= 0
    );
  }

  private async checkDatesforUpdate(
    updateVacationDto: UpdateVacationDto,
    id: string,
  ) {
    const existingVacation = await this.vacationModel.findById(id);
    if (!existingVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }

    const startDate = this.formatDate(new Date(updateVacationDto.startDate));
    const endDate = this.formatDate(new Date(updateVacationDto.endDate));
    const today = this.formatDate(new Date());

    if (this.compareDates(startDate, today) <= 0) {
      throw new ConflictException(
        `Start date ${startDate} must be greater than today ${today}`,
      );
    }

    if (this.compareDates(endDate, startDate) < 0) {
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
      const vacationStart = this.formatDate(new Date(vacation.startDate));
      const vacationEnd = this.formatDate(new Date(vacation.endDate));

      if (
        vacation._id.toString() !== id &&
        this.isDateRangeOverlapping(
          startDate,
          endDate,
          vacationStart,
          vacationEnd,
        )
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
    const startDate = this.formatDate(new Date(vacationData.startDate));
    const endDate = this.formatDate(new Date(vacationData.endDate));
    const today = this.formatDate(new Date());

    if (this.compareDates(startDate, today) <= 0) {
      throw new ConflictException(
        `Start date ${startDate} must be greater than today ${today}`,
      );
    }

    if (this.compareDates(endDate, startDate) < 0) {
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
      const vacationStart = this.formatDate(new Date(vacation.startDate));
      const vacationEnd = this.formatDate(new Date(vacation.endDate));

      if (
        this.isDateRangeOverlapping(
          startDate,
          endDate,
          vacationStart,
          vacationEnd,
        )
      ) {
        throw new ConflictException(
          `New vacation conflicts with an existing vacation from ${vacationStart} to ${vacationEnd}`,
        );
      }
    }
  }
}
