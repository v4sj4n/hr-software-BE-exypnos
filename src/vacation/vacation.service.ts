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
  async checkDatesforUpdate(updateVacationDto: UpdateVacationDto, id: string) {
    const existingVacation = await this.vacationModel.findById(id);
    if (!existingVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    const startDate = new Date(updateVacationDto.startDate);
    const endDate = new Date(updateVacationDto.endDate);
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}:${month}:${year}`;
    };
    if (formatDate(startDate) <= formatDate(new Date())) {
      throw new ConflictException(
        `Start date ${formatDate(startDate)} must be greater than today ${formatDate(new Date())}`,
      );
    }
    if (formatDate(endDate) < formatDate(startDate)) {
      throw new ConflictException(
        `End date ${formatDate(endDate)} must be greater than start date ${formatDate(startDate)}`,
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
      const newVacationStart = formatDate(startDate);
      const newVacationEnd = formatDate(endDate);
      console.log(vacationStart, vacationEnd, newVacationStart, newVacationEnd);

      if (
        (newVacationStart >= vacationStart &&
          newVacationStart <= vacationEnd) ||
        (newVacationEnd >= vacationStart && newVacationEnd <= vacationEnd) ||
        (newVacationStart <= vacationStart && newVacationEnd >= vacationEnd)
      ) {
        throw new ConflictException(
          `New vacation conflicts with an existing vacation from ${newVacationStart} to ${newVacationEnd}`,
        );
      }
    }
  }
  private async checkDatesforCreate(
    vacationData: CreateVacationDto | UpdateVacationDto,
  ) {
    const startDate = new Date(vacationData.startDate);
    const endDate = new Date(vacationData.endDate);
    const today = new Date();
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}:${month}:${year}`;
    };

    if (formatDate(startDate) <= formatDate(today)) {
      throw new ConflictException(
        `Start date ${formatDate(startDate)} must be greater than today ${formatDate(new Date())}`,
      );
    }
    if (formatDate(endDate) < formatDate(startDate)) {
      throw new ConflictException(
        `End date ${formatDate(endDate)} must be greater than start date ${formatDate(startDate)}`,
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
      const newVacationStart = formatDate(startDate);
      const newVacationEnd = formatDate(endDate);

      if (
        (newVacationStart >= vacationStart &&
          newVacationStart <= vacationEnd) ||
        (newVacationEnd >= vacationStart && newVacationEnd <= vacationEnd) ||
        (newVacationStart <= vacationStart && newVacationEnd >= vacationEnd)
      ) {
        throw new ConflictException(
          `New vacation conflicts with an existing vacation from ${newVacationStart} to ${newVacationEnd}`,
        );
      }
    }
  }
}
