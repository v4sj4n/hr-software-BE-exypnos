import { IsString, IsEmail, IsDateString, IsOptional, IsNumberString } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  experience: string;

  @IsString()
  applicationMethod: string;

  @IsNumberString()
  age: number;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  positionApplied: string;

  @IsString()
  technologiesUsed: string;

  @IsString()
  individualProjects: string;

  @IsDateString()
  interviewDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  salaryExpectations: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  cvAttachment?: string;
}
