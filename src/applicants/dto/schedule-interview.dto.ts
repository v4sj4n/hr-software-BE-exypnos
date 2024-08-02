import { IsString, IsDateString } from 'class-validator';

export class ScheduleInterviewDto {
  @IsString()
  phase: string;

  @IsDateString()
  interviewDate: string;
}
