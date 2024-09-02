import { IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { PositionType, GradeType } from '../../common/enum/position.enum';

export class UpdatePromotionDto {
  @IsOptional()
  @IsMongoId()
  readonly userId?: Types.ObjectId;

  @IsOptional()
  @IsEnum(PositionType)
  readonly position?: PositionType;

  @IsOptional()
  @IsDateString()
  readonly startDate?: Date;

  @IsOptional()
  @IsEnum(GradeType)
  readonly grade?: GradeType;
}
