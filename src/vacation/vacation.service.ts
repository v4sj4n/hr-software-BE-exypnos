import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Vacation } from 'src/schemas/vacation.schema';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';

@Injectable()
export class VacationService {
  constructor(
    @InjectModel(Vacation.name) private vacationModel: Model<Vacation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    try {
      await this.checkCreateUserId(createVacationDto);
      await this.checkCreateDate(createVacationDto);

      const createdVacation = new this.vacationModel(createVacationDto);

      return await createdVacation.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new ConflictException(error.message);
    }
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
    await this.checkUpdateDate(updateVacationDto, id);
    const updatedVacation = await this.vacationModel.findByIdAndUpdate(
      id,
      updateVacationDto,
      { new: true },
    );
    if (!updatedVacation) {
      throw new NotFoundException(`Vacation with id ${id} not found`);
    }
    return updatedVacation;
  }

  async remove(id: string) {
    return await this.vacationModel.findByIdAndDelete(id);
  }
  //funksione ndimese per te bere CRUD operations mbi databazen
  async checkCreateUserId(createVacationDto: CreateVacationDto) {
    if (
      createVacationDto.userId &&
      createVacationDto.userId !== null &&
      createVacationDto.userId.length === 24
    ) {
      const userExists = this.userModel.findById(createVacationDto.userId);
      if (!userExists) {
        throw new NotFoundException(
          `User with id ${createVacationDto.userId} not found`,
        );
      }
    } else {
      createVacationDto.userId = null;
    }
  }

  async checkCreateDate(createVacationDto: CreateVacationDto) {
    const startDate = new Date(createVacationDto.startDate);
    const endDate = new Date(createVacationDto.endDate);

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
          userId: createVacationDto.userId,
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

  async checkUpdateDate(updateVacationDto: UpdateVacationDto, id: string) {
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
}
