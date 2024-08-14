import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateApplicantDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  experience: string;

  @IsNotEmpty()
  applicationMethod: string;

  @IsNotEmpty()
  dob: Date;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  positionApplied: string;

  @IsNotEmpty()
  technologiesUsed: string;

  @IsNotEmpty()
  salaryExpectations: string;

  @IsOptional()
  currentPhase?: string;
}
