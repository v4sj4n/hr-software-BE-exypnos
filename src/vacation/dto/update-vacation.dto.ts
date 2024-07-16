import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VacationType } from 'src/schemas/vacation.schema';
import { Type } from 'class-transformer';

export class UpdateVacationDto {
  @IsEnum(VacationType)
  @IsOptional()
  type: VacationType;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  userId: string;
}
