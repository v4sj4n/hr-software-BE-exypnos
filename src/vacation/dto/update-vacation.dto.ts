import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { VacationType } from 'src/common/enum/vacation.enum';

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
