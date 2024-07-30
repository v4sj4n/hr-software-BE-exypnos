import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  interviewDate?: string;
}
