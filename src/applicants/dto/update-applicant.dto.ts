import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class UpdateApplicantDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  applicationMethod?: string;

  @IsOptional()
  @IsString()
  age: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  positionApplied?: string;

  @IsOptional()
  @IsString()
  technologiesUsed?: string;

  @IsOptional()
  @IsString()
  individualProjects?: string;

  @IsOptional()
  @IsString()
  salaryExpectations?: string;

  @IsOptional()
  @IsString()
  cvAttachment?: string;

  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
