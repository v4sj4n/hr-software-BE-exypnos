// src/ratings/dto/create-rating.dto.ts
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreateRatingDto {
  @IsNotEmpty()
  readonly userId: Types.ObjectId;

  @IsNotEmpty()
  readonly projectId: Types.ObjectId;

  @IsNotEmpty()
  readonly projectManagerId: Types.ObjectId;  

  @IsOptional()
  @IsNumber()
  readonly productivityScore?: number;

  @IsOptional()
  @IsNumber()
  readonly teamCollaborationScore?: number;

  @IsOptional()
  @IsNumber()
  readonly technicalSkillLevel?: number;

  @IsOptional()
  @IsNumber()
  readonly clientFeedbackRating?: number;
}
