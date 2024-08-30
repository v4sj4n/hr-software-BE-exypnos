import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PositionType, GradeType } from '../enum/position.enum';
import { User } from './user.schema';

export type PromotionDocument = Promotion & Document;

@Schema()
export class Promotion {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;
  
  @Prop({ required: false, enum: PositionType, type: String })
  position: string;
  
  @Prop({ required: false, type: Date })
  startDate: Date;
  
  @Prop({ required: false, enum: GradeType, type: String })
  grade: GradeType;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
