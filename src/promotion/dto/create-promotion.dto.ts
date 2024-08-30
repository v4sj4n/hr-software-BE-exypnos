// src/promotion/dto/create-promotion.dto.ts
import { IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Types } from 'mongoose';
import { PositionType, GradeType } from '../../common/enum/position.enum';

export class CreatePromotionDto {
  @IsNotEmpty()
  readonly userId: Types.ObjectId;

  @IsOptional()
  @IsEnum(PositionType)
  readonly position: PositionType;

  @IsOptional()
  @IsDateString()
  readonly startDate: Date;

  @IsOptional()
  @IsEnum(GradeType)
  readonly grade: GradeType;
}
