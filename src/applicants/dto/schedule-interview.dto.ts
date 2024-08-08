import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ScheduleInterviewDto {
  @IsString()
  phase: 'applicant' | 'first' | 'second';

  @IsDateString()
  interviewDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
