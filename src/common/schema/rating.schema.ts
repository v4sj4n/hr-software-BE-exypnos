import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: false, type: Number })
  productivityScore?: number;

  @Prop({ required: false, type: Number })
  teamCollaborationScore?: number;

  @Prop({ required: false, type: Number })
  technicalSkillLevel?: number;

  @Prop({ required: false, type: Number })
  clientFeedbackRating?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
