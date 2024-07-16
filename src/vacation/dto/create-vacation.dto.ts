import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { VacationType } from 'src/common/enum/vacation.enum';

export class CreateVacationDto {
  @IsEnum(VacationType)
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
  userId: string;
}
