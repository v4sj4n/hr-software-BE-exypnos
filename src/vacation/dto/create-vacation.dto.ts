import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VacationType } from 'src/common/enum/vacation.enum';
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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  userId: Types.ObjectId;
}
