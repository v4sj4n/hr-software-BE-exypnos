import { IsNumber, IsString, IsOptional, IsMongoId, Min, Max } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSalaryDto {
  @IsNumber()
  netSalary: number;

  @IsNumber()
  workingDays: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  socialSecurity?: number;

  @IsOptional()
  @IsNumber()
  healthInsurance?: number;

  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsOptional()
  @IsString()
  uniqueId?: string;
}
