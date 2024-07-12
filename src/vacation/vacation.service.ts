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
      if (
        createVacationDto.userId &&
        createVacationDto.userId !== null &&
        createVacationDto.userId.length === 24
      ) {
        console.log(createVacationDto.userId);
        const userExists = await this.userModel.findById(
          createVacationDto.userId,
        );
        console.log(userExists);
        if (!userExists) {
          throw new NotFoundException(
            `User with id ${createVacationDto.userId} not found`,
          );
        } else {
          const createdVacation = new this.vacationModel(createVacationDto);
          return await createdVacation.save();
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
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
    if (updateVacationDto.userId) {
      if (
        updateVacationDto.userId &&
        updateVacationDto.userId !== null &&
        updateVacationDto.userId.length === 24
      ) {
        const userExists = await this.userModel.findById(
          updateVacationDto.userId,
        );
        if (!userExists) {
          throw new NotFoundException(
            `User with id ${updateVacationDto.userId} not found`,
          );
        }
      }
    }
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
}

//funksione ndimese per te bere CRUD operations mbi databazen
