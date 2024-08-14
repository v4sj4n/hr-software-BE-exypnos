import { IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
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
  @Min(1)
  @Max(12)
  month: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsMongoId()
  userId: Types.ObjectId;

  @IsOptional()
  @IsString()
  uniqueId?: string;
}
