import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { NotificationType } from '../../common/enum/notification.enum';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsMongoId()
  typeId: Types.ObjectId;
}
