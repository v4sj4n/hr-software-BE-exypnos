import { IsString, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePollOptionDto } from './create-poll-option.dto';

export class CreatePollDto {
  @IsString()
  question: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePollOptionDto)
  options: CreatePollOptionDto[];
}
