import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  experience: string;

  @IsString()
  applicationMethod: string;

  @IsString()
  age: string;

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

  @IsString()
  salaryExpectations: string;

  @IsOptional()
  @IsString()
  cvAttachment?: string;
}
