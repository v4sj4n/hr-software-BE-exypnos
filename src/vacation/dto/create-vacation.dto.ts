import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { VacationType } from 'src/common/enum/vacation.enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateVacationDto {
  @IsEnum(VacationType)
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  userId: Types.ObjectId;
}
