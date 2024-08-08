import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';

export class UpdateApplicantDto {
  static interviewDate(interviewDate: any) {
    throw new Error('Method not implemented.');
  }
  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @IsOptional()
  @IsString()
  interviewDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  message?: string;
}