import { ConflictException, NotFoundException } from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import {
  compareDates,
  formatDate,
  isDateRangeOverlapping,
} from '../common/util/dateUtil';
import { User } from 'src/common/schema/user.schema';
import { Vacation } from 'src/common/schema/vacation.schema';

async function checkUserId(userModel: Model<User>, userId: Types.ObjectId) {
  const userExists = await userModel.findById(userId);
  if (!userExists) {
    throw new NotFoundException(`User with id ${userId} not found`);
  }
}

async function checkDatesforUpdate(
  vacationModel: Model<Vacation>,
  updateVacationDto: UpdateVacationDto,
  id: string,
) {
  const existingVacation = await vacationModel.findById(id);
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

  const conflictingVacation = await vacationModel.aggregate([
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

async function checkDatesforCreate(
  vacationModel: Model<Vacation>,
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

  const conflictingVacation = await vacationModel.aggregate([
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

export { checkUserId, checkDatesforUpdate, checkDatesforCreate };
