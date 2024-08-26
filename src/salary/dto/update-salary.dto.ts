import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber()
  netSalary: number;

  @IsOptional()
  @IsNumber()
  workingDays: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  bonusDescription?: string;

  @IsOptional()
  @IsNumber()
  socialSecurity?: number;

  @IsOptional()
  @IsNumber()
  healthInsurance?: number;

  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(11)
  month: string;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsMongoId()
  userId: Types.ObjectId;
}
