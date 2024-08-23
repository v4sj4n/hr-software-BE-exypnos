
import { IsOptional, IsEnum, IsDate, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { GradeType, PositionType } from 'src/common/enum/position.enum';


export class UpdatePromotionDto {
  @IsOptional()
  userId: Types.ObjectId;

  @IsOptional()
  projectId?: Types.ObjectId;

  @IsOptional()
  @IsEnum(PositionType)
  position?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsEnum(GradeType)
  grade?: GradeType;

  @IsOptional()
  @IsNumber()
  productivityScore?: number;

  @IsOptional()
  @IsNumber()
  teamCollaborationScore?: number;

  @IsOptional()
  @IsNumber()
  technicalSkillLevel?: number;

  @IsOptional()
  @IsNumber()
  clientFeedbackRating?: number;
}