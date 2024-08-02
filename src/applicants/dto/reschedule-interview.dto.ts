import { IsString, IsDateString } from 'class-validator';

export class RescheduleInterviewDto {
  @IsString()
  phase: string;

  @IsDateString()
  newInterviewDate: string;
}
