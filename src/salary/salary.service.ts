import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Salary } from '../common/schema/salary.schema';
import { User } from '../common/schema/user.schema';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(Salary.name) private salaryModel: Model<Salary>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    try {
      await this.checkUserId(createSalaryDto.userId);
      await this.validateSalaryData(createSalaryDto);
      const salarys = await this.salaryModel.find();
      for (const salary of salarys) {
        if (
          this.ismatch(
            createSalaryDto.userId as unknown as string,
            createSalaryDto.month,
            createSalaryDto.year,
            salary.uniqueId,
          )
        ) {
          throw new ConflictException(
            'Salary already exists for this user in this month',
          );
        }
      }
      const createdSalary = new this.salaryModel(createSalaryDto);
      createdSalary.uniqueId = await this.createUniqueId(createSalaryDto);
      return await createdSalary.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(): Promise<Salary[]> {
    try {
      return await this.salaryModel.find();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string): Promise<Salary> {
    try {
      const salary = await this.salaryModel.findById(id);
      if (!salary) {
        throw new NotFoundException(`Salary with id ${id} not found`);
      }
      return salary;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async update(id: string, updateSalaryDto: UpdateSalaryDto): Promise<Salary> {
    try {
      const existingSalary = await this.salaryModel.findById(id);
      if (!existingSalary) {
        throw new NotFoundException(`Salary with id ${id} not found`);
      }
      if (updateSalaryDto.userId) {
        await this.checkUserId(updateSalaryDto.userId);
      }
      await this.validateSalaryData(updateSalaryDto);

      const updatedSalary = await this.salaryModel.findByIdAndUpdate(
        id,
        {
          ...updateSalaryDto,
        },
        { new: true },
      );
      return updatedSalary;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async remove(id: string): Promise<Salary> {
    try {
      const salary = await this.salaryModel.findByIdAndDelete(id);
      if (!salary) {
        throw new NotFoundException(`Salary with id ${id} not found`);
      }
      return salary;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  private async validateSalaryData(
    salaryData: CreateSalaryDto | UpdateSalaryDto,
  ) {
    if (salaryData.amount && salaryData.amount < 0) {
      throw new ConflictException('Salary amount cannot be negative');
    }
    if (salaryData.bonus && salaryData.bonus < 0) {
      throw new ConflictException('Bonus amount cannot be negative');
    }
  }
  private async checkUserId(userId: Types.ObjectId) {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }

  private async createUniqueId(
    salary: CreateSalaryDto | UpdateSalaryDto,
  ): Promise<string> {
    const uniqueId = await bcrypt.hash(
      `${salary.userId}${salary.month}${salary.year}`,
      10,
    );
    return uniqueId;
  }

  private async ismatch(
    userId: string,
    month: number,
    year: number,
    uniqueId: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(`${userId}${month}${year}`, uniqueId);
    return isMatch;
  }

  //for later use
  async getSalaryByUserId(userId: string): Promise<Salary> {
    const salary = await this.salaryModel.findOne({ userId });
    if (!salary) {
      throw new NotFoundException(`Salary with user id ${userId} not found`);
    }
    return salary;
  }

  async getSalaryByUniqueId(uniqueId: string): Promise<Salary> {
    const salary = await this.salaryModel.findOne({ uniqueId });
    if (!salary) {
      throw new NotFoundException(
        `Salary with unique id ${uniqueId} not found`,
      );
    }
    return salary;
  }

  async getSalaryByMonthAndYear(
    month: number,
    year: number,
  ): Promise<Salary[]> {
    const salary = await this.salaryModel.find({ month, year });
    if (!salary) {
      throw new NotFoundException(
        `Salary with month ${month} and year ${year} not found`,
      );
    }
    return salary;
  }
}
