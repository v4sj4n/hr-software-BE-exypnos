import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  willBeReminded: boolean;

  @IsOptional()
  date: string;
}
