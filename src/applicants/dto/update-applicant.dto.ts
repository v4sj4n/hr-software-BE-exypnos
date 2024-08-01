import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';

export class UpdateApplicantDto {
  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
