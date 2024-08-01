import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Poll } from 'src/common/schema/event.schema';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  poll: Poll;
}
