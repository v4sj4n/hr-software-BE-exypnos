import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Project } from './project.schema';
import { User } from './user.schema';

@Schema()
export class Rating {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true, ref: Project.name })
  projectId: Types.ObjectId;
  
  @Prop({ required: false, type: Number })
  productivityScore: number;
  
  @Prop({ required: false, type: Number })
  teamCollaborationScore: number;
  
  @Prop({ required: false, type: Number })
  technicalSkillLevel: number;
  
  @Prop({ required: false, type: Number })
  clientFeedbackRating: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
