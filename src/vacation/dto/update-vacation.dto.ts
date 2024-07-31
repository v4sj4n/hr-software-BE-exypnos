import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VacationType } from 'src/common/enum/vacation.enum';
import { Types } from 'mongoose';

export class UpdateVacationDto {
  @IsEnum(VacationType)
  @IsOptional()
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString() 
  @IsOptional()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  userId: Types.ObjectId;
}
