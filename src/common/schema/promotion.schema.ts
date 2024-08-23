// src/dev-promotion/entities/dev-promotion.entity.ts

import { Types } from 'mongoose';
import { User } from './user.schema';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Project } from './project.schema';
import { GradeType, PositionType } from '../enum/position.enum';

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Project.name })
  projectId: Types.ObjectId;

  @Prop({ required: false, enum: PositionType, type: String })
  position: string;

  @Prop({ required: false, type: Date })
  startDate: Date;

  @Prop({ required: false, enum: GradeType, type: String })
  grade: GradeType;

  @Prop({ required: false, type: Number })
  productivityScore: number;

  @Prop({ required: false, type: Number })
  teamCollaborationScore: number;

  @Prop({ required: false, type: Number })
  technicalSkillLevel: number;

  @Prop({ required: false, type: Number })
  clientFeedbackRating: number;
}

const PromotionSchema = SchemaFactory.createForClass(Promotion);
PromotionSchema.index({ userId: 1, projectId: 1 }, { unique: true });
PromotionSchema.pre('save', function () {
  if (this.projectId) {
    this.productivityScore = this.productivityScore || 0;
    this.teamCollaborationScore = this.teamCollaborationScore || 0;
    this.technicalSkillLevel = this.technicalSkillLevel || 0;
    this.clientFeedbackRating = this.clientFeedbackRating || 0;
    this.position = null;
    this.grade = null;
    this.startDate = null;
  }else{
    this.projectId = null;
    this.productivityScore = null;
    this.teamCollaborationScore = null;
    this.technicalSkillLevel = null;
    this.clientFeedbackRating = null;
  }
});

export { PromotionSchema };
