import { Type } from 'class-transformer';
import { IsString, IsDateString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Poll } from 'src/common/schema/event.schema';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @Type(() => PollDto)
  poll: Poll;

  @IsOptional()
  @IsString()
  location: string;
}

class PollDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  question: string;

  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  @MinLength(1)
  @MaxLength(10)
  options: string[];

  @IsOptional()
  isMultipleVote: boolean;
}
