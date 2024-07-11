import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum VacationType {
  VACATION = 'vacation',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
}
@Schema()
export class Vacation {
  @Prop({ required: true, enum: VacationType })
  type: VacationType;

  @Prop({ required: false })
  description: string;

  @Prop({ default: Date.now })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop({
    required: true,
    ref: 'User',
  })
  userId: string;
}

export const VacationSchema = SchemaFactory.createForClass(Vacation);
