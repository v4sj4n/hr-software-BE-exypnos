import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  experience: string;

  @IsString()
  applicationMethod: string;

  @IsNumber()
  age: number;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsString()
  positionApplied: string;

  @IsString()
  technologiesUsed: string;

  @IsString()
  individualProjects: string;

  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @IsString()
  notes: string;

  @IsString()
  salaryExpectations: string;

  @IsOptional()
  @IsString()
  cvAttachment?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  interviewNotes?: string;

  @IsOptional()
  @IsString()
  rejectionNotes?: string;
}
