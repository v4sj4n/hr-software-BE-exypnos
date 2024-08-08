import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInterviewStatusDto {
  @IsNotEmpty()
  @IsString()
  phase: 'first' | 'second';

  @IsOptional()
  @IsString()
  status: 'accepted' | 'rejected ';

  @IsOptional()
  @IsString()
  interviewDate?: string;
}