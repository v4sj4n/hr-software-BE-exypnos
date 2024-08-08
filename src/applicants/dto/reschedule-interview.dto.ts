import { IsDateString, IsString } from 'class-validator';

export class RescheduleInterviewDto {
  @IsString()
  phase: 'applicant' | 'first' | 'second';

  @IsDateString()
  newInterviewDate: string;
}
