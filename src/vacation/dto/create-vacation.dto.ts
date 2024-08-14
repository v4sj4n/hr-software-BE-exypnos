import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { VacationStatus, VacationType } from 'src/common/enum/vacation.enum';
import { Types } from 'mongoose';
export class CreateVacationDto {
  @IsEnum(VacationType)
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate?: Date;

  @IsEnum(VacationStatus)
  @IsOptional()
  status?: VacationStatus;

  @IsString()
  userId: Types.ObjectId;
}
