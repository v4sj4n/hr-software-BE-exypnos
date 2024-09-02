import { IsOptional, IsNumber, IsMongoId, Min, Max } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateRatingDto {
  @IsOptional()
  @IsMongoId()
  readonly userId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  readonly projectId?: Types.ObjectId;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly productivityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly teamCollaborationScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly technicalSkillLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly clientFeedbackRating?: number;
}
