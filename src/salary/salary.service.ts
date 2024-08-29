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
import { Cron } from '@nestjs/schedule';
import { paginate } from 'src/common/util/pagination';
import { populate } from 'dotenv';
import { resolve } from 'path';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(Salary.name) private salaryModel: Model<Salary>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    try {
      await this.checkUserId(createSalaryDto.userId);
      const month = new Date().getMonth() - 1;
      const year = new Date().getFullYear();
      createSalaryDto.userId = new Types.ObjectId(createSalaryDto.userId);

      if (
        await this.salaryModel.findOne({
          userId: createSalaryDto.userId,
          month: month,
          year: year,
        })
      ) {
        throw new ConflictException('Salary already exists');
      } else {
        const newSalary = new this.salaryModel(
          await this.calculateNetSalary(createSalaryDto),
        );
        return newSalary.save();
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(
    page: number,
    limit: number,
    month?: number,
    year?: number,
  ): Promise<Salary[]> {
    try {
      console.log('month', month);
      console.log('year', year);
      console.log('page', page);
      console.log('limit', limit);
      const filter: any = {};
      if (month !== null && month !== undefined) {
        filter.month = month;
      }
      if (year) {
        filter.year = year;
      }
      const paginateSalary = await paginate(
        page,
        limit,
        this.salaryModel,
        filter,
      );
      paginateSalary.data = await this.salaryModel
        .find(filter)
        .sort({
          month: -1,
          year: -1,
        })
        .populate('userId', 'firstName lastName phone position createdAt');
      return paginateSalary;
    } catch (error) {
      console.log(error);
      throw new ConflictException(error);
    }
  }

  async findByUserId(
    page: number,
    limit: number,
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
        let query = this.salaryModel.find(filter).sort({ month: 1 });
        query = query.limit(6);
        return query;
      }
      const paginateSalary = await paginate(
        page,
        limit,
        this.salaryModel,
        filter,
      );
      paginateSalary.data = await this.salaryModel
        .find(filter)
        .sort({
          month: -1,
          year: -1,
        })
        .populate('userId', 'firstName lastName phone position createdAt');
      return paginateSalary;
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
          netSalary: (await this.calculateNetSalary(updateSalaryDto)).netSalary,
          tax: (await this.calculateNetSalary(updateSalaryDto)).tax,
          healthInsurance: (await this.calculateNetSalary(updateSalaryDto))
            .healthInsurance,
          socialSecurity: (await this.calculateNetSalary(updateSalaryDto))
            .socialSecurity,
        },
        { new: true },
      );
      return updatedSalary;
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

  private async calculateNetSalary(
    salaryData: CreateSalaryDto | UpdateSalaryDto,
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
      netSalary: Math.round(netSalary),
      month: new Date().getMonth() - 1,
      year: new Date().getFullYear(),
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
          var newSalary = {
            workingDays: currentSalary.workingDays,
            currency: currentSalary.currency,
            bonus: currentSalary.bonus,
            bonusDescription: currentSalary.bonusDescription,
            grossSalary: currentSalary.grossSalary,
            userId: currentSalary.userId,
            month: nextMonth,
            year: nextYear,
            extraHours: currentSalary.extraHours,
          };
        }
        await this.create(newSalary);
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
