import { IsString, IsDateString, IsOptional, IsEnum, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import { Poll } from '../../common/schema/event.schema';
import { EventType } from 'src/common/enum/event.enum';
import { Types } from 'mongoose';
export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsEnum(EventType)
  type: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  poll: Poll;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  participants: Types.ObjectId[];

  @IsOptional()
  @IsString()
  location: string;
}
