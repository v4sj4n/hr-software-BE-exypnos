import { IsEnum } from 'class-validator';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';

export class UpdateApplicantStatusDto {
  @IsEnum(ApplicantStatus)
  status: ApplicantStatus;
}
