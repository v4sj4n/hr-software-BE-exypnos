import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(22)
  workingDays: number;

  @IsOptional()
  @IsString()
  @Min(0)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  bonusDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  socialSecurity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  healthInsurance?: number;

  @IsOptional()
  @IsNumber()
  @Min(400)
  grossSalary?: number;
}
