import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicantDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  experience: string;

  @IsNotEmpty()
  @IsString()
  applicationMethod: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  positionApplied: string;

  @IsNotEmpty()
  @IsString()
  technologiesUsed: string;

  @IsOptional()
  @IsString()
  individualProjects?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsString()
  salaryExpectations: string;
}