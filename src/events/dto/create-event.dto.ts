import { IsString, IsDateString, IsOptional } from 'class-validator';
import { Poll } from 'src/common/schema/event.schema';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  poll: Poll;

  @IsOptional()
  @IsString()
  location: string;
}
