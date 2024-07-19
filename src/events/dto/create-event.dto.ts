import { IsString, IsDateString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePollDto } from '../../poll.events/dto/create-poll.dto';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePollDto)
  poll?: CreatePollDto;
}
