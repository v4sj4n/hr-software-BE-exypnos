import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateApplicantDto {
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
  @IsDateString()
  dob: Date;

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
  @IsDateString()
  firstInterviewDate?: Date;

  @IsOptional()
  @IsDateString()
  secondInterviewDate?: Date;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsString()
  salaryExpectations: string;

  @IsOptional()
  @IsString()
  cvAttachment?: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  currentPhase?: string;
}
