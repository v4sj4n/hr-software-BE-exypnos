import { IsOptional, IsString } from 'class-validator';

export class CreateApplicantDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  experience: string;

  @IsOptional()
  @IsString()
  applicationMethod: string;

  @IsOptional()
  @IsString()
  age: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  positionApplied: string;

  @IsOptional()
  @IsString()
  technologiesUsed: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  salaryExpectations: string;
}
