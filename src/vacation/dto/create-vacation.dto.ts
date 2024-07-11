import { IsString, IsEnum, IsOptional } from 'class-validator';
import { VacationType } from '../../schemas/vacation.schema';
import { IsDate } from 'class-validator';

export class CreateVacationDto {
  @IsEnum(VacationType)
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @IsDate()
  @IsOptional()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  userId?: string;
}
