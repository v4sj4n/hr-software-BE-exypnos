import { IsString } from 'class-validator';

export class AddInterviewNoteDto {
  @IsString()
  phase: string;

  @IsString()
  note: string;
}
