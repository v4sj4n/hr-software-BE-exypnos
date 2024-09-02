import { IsNotEmpty, IsMongoId, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;  

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  productivityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  teamCollaborationScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  technicalSkillLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  clientFeedbackRating?: number;
}
