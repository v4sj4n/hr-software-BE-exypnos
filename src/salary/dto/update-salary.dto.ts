import { IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  currency: string;

  @IsOptional()
  @IsNumber()
  bonus: number;

  @IsOptional()
  @IsNumber()
  month: number;

  @IsOptional()
  @IsNumber()
  year: number;

  @IsOptional()
  userId: Types.ObjectId;
}
