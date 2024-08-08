import { IsNotEmpty, IsString } from 'class-validator';

export class AddInterviewNoteDto {
  @IsNotEmpty()
  @IsString()
  phase: 'first' | 'second';

  @IsNotEmpty()
  @IsString()
  note: string;
}