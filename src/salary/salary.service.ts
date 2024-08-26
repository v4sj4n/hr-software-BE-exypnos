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
import { Cron } from '@nestjs/schedule';

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

      const uniqueId = await this.createUniqueId(
        createSalaryDto.userId as unknown as string,
        createSalaryDto.month,
        createSalaryDto.year,
      );
      createSalaryDto.userId = new Types.ObjectId(createSalaryDto.userId);
      const newSalary = new this.salaryModel(
        await this.calculateNetSalary(createSalaryDto, uniqueId),
      );
      return newSalary.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(month?: number, year?: number): Promise<Salary[]> {
    try {
      const filter: any = {};

      if (month !== null && month !== undefined) {
        filter.month = month;
      }
      if (year) {
        filter.year = year;
      }

      const salaries = await this.salaryModel
        .find(filter)
        .sort({ month: -1, year: -1 })
        .populate('userId', 'firstName lastName phone position createdAt');
      return salaries;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findByUserId(
    userId: string,
    month?: number,
    year?: number,
    graf?: boolean,
  ): Promise<Salary[]> {
    try {
      const filter: any = {};
      if (userId) {
        filter.userId = new Types.ObjectId(userId);
      }
      if (month) {
        filter.month = month;
      }
      if (year) {
        filter.year = year;
      }

      if (graf) {
        let query = this.salaryModel
          .find(filter)
          .sort({ year: -1, month: -1 })
          .populate('userId', 'firstName lastName phone position createdAt');
        query = query.limit(6);
      }

      const salaries = await this.salaryModel
        .find(filter)
        .sort({ month: -1, year: -1 })
        .populate('userId', 'firstName lastName phone position createdAt');
      return salaries;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string): Promise<Salary> {
    try {
      const salary = await this.salaryModel
        .findById(id)
        .populate('userId', 'firstName lastName phone position createdAt');
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
      const salary = await this.salaryModel.findById(id);
      const updatedSalary = await this.salaryModel.findByIdAndUpdate(
        id,
        {
          ...updateSalaryDto,
          netSalary: (
            await this.calculateNetSalary(updateSalaryDto, salary.uniqueId)
          ).netSalary,
        },
        { new: true },
      );
      return updatedSalary;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  private async validateSalaryData(salaryData: CreateSalaryDto) {
    if (salaryData.bonus && salaryData.bonus < 0) {
      throw new ConflictException('Bonus amount cannot be negative');
    }
    if (salaryData.month && salaryData.year && salaryData.userId) {
      for (const salary of await this.salaryModel.find()) {
        if (
          await this.ismatch(
            salaryData.userId,
            salaryData.month as number,
            salaryData.year,
            salary.uniqueId,
          )
        ) {
          throw new ConflictException(
            `Salary for user ${salaryData.userId} for month ${salaryData.month} and year ${salaryData.year} already exists`,
          );
        }
      }
    }
  }
  private async checkUserId(userId: Types.ObjectId) {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }

  private async createUniqueId(
    userId: string,
    month: number,
    year: number,
  ): Promise<string> {
    const uniqueId = await bcrypt.hash(`${userId}${month}${year}`, 10);
    await bcrypt.genSalt(10);
    return uniqueId;
  }

  private async ismatch(
    userId: Types.ObjectId,
    month: number,
    year: number,
    uniqueId: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(
      `${userId}${String(month)}${year}`,
      uniqueId,
    );
    return isMatch;
  }

  private async calculateNetSalary(
    salaryData: CreateSalaryDto | UpdateSalaryDto,
    uniqueId: string,
  ): Promise<Salary> {
    const grossSalary = (salaryData.grossSalary / 22) * salaryData.workingDays;
    const healthInsurance = 0.017 * grossSalary;
    const socialInsurance = 0.095 * grossSalary;
    let tax = 0;
    if (grossSalary <= 50000) {
      tax = 0;
    } else if (grossSalary <= 60000) {
      tax = 0.13 * (grossSalary - 35000);
    } else if (grossSalary <= 200000) {
      tax = 0.13 * (grossSalary - 30000);
    } else {
      tax = 0.23 * (grossSalary - 200000) + 0.13 * (grossSalary - 170000);
    }
    let netSalary = grossSalary - tax - healthInsurance - socialInsurance;
    if (salaryData.bonus) {
      netSalary =
        grossSalary -
        tax -
        healthInsurance -
        socialInsurance +
        salaryData.bonus;
    } else {
      salaryData.bonus = 0;
    }

    salaryData.socialSecurity = Math.round(socialInsurance);
    salaryData.healthInsurance = Math.round(healthInsurance); 
    salaryData.tax = Math.round(tax);

    const salary = new this.salaryModel({
      ...salaryData,
      uniqueId,
      netSalary: Math.round(netSalary),
    });
    return salary;
  }

  @Cron('0 0 28 * *')
  async handleCron() {
    try {
      const currentSalaries = await this.findAll(
        new Date().getMonth(),
        new Date().getFullYear(),
      );

      for (const currentSalary of currentSalaries) {
        const nextMonth = (currentSalary.month + 1) % 12 || 12;
        const nextYear =
          currentSalary.month + 1 > 11
            ? currentSalary.year + 1
            : currentSalary.year;

        const user = await this.userModel.find({
          _id: currentSalary.userId,
          isDeleted: false,
        });
        if (user) {
          var newSalary: CreateSalaryDto = {
            workingDays: currentSalary.workingDays,
            currency: currentSalary.currency,
            bonus: currentSalary.bonus,
            bonusDescription: currentSalary.bonusDescription,
            grossSalary: currentSalary.grossSalary,
            month: nextMonth,
            year: nextYear,
            userId: currentSalary.userId,
          };
        }
        await this.create(newSalary);
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
