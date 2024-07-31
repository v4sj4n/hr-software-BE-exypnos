import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { VacationType } from 'src/common/enum/vacation.enum';
import { Types } from 'mongoose';

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
