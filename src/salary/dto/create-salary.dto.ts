import {
  IsNumber,
  IsString,
  IsOptional,
  IsMongoId,
  Min,
  Max,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateSalaryDto {

  @IsNumber()
  @Min(1)
  netSalary: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  workingDays: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bonus?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  bonusDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  socialSecurity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  healthInsurance?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  grossSalary?: number;

  @IsNumber()
  @Min(0)
  @Max(11)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;

  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

}
