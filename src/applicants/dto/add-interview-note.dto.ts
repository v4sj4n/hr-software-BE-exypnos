import { IsOptional, IsString } from 'class-validator';

export class AddInterviewNoteDto {
  @IsOptional()
  @IsString()
  phase: 'first' | 'second';

  @IsOptional()
  @IsString()
  note: string;
}
