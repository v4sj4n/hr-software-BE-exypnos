import { IsEnum } from 'class-validator';
import { ApplicantStatus } from 'src/common/enum/applicant.enum';

export class UpdateApplicantStatusDto {
  @IsEnum(ApplicantStatus)
  status: ApplicantStatus;
}
