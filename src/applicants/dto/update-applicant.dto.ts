import { IsOptional } from "class-validator";

export class UpdateApplicantDto {
@IsOptional()
  firstName: string;

@IsOptional()
lastName: string;

@IsOptional()
  experience: string;

@IsOptional()
  applicationMethod: string;

@IsOptional()

  dob: Date;

@IsOptional()

  phoneNumber: string;

@IsOptional()
email: string;

@IsOptional()

positionApplied: string;
@IsOptional()

technologiesUsed: string;
@IsOptional()

firstInterviewDate?: Date;
@IsOptional()

secondInterviewDate?: Date;
@IsOptional()
notes: string;

@IsOptional()
salaryExpectations: string;

@IsOptional()
cvAttachment?: string;

@IsOptional()
status: string;

@IsOptional()
currentPhase?: string;
}
