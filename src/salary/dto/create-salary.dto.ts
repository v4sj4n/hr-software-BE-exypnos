import { IsNumber, IsString, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSalaryDto {
  @IsNumber()
  @Min(40000)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bonus?: number;

  @IsNotEmpty()
  @IsNumber()
  month: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  userId: Types.ObjectId;
}
