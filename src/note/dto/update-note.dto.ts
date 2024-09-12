import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  willBeReminded: boolean;

  @IsOptional()
  @IsDateString()
  date: Date;
}
