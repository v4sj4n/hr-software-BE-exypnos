import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VacationType } from 'src/common/enum/vacation.enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateVacationDto {
  @IsEnum(VacationType)
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Date)
  startDate: Date;

  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  userId: Types.ObjectId;
}
