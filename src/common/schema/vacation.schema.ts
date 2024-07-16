import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { VacationType } from '../enum/vacation.enum';


@Schema()
export class Vacation {
  @Prop({ required: true, enum: VacationType })
  type: VacationType;

  @Prop({ required: false })
  description: string;

  @Prop({ default: Date.now })
  startDate: Date;

  @Prop({ default: new Date(new Date().setDate(new Date().getDate() + 1)) })
  endDate: Date;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'user',
  })
  userId: Types.ObjectId;
}

export const VacationSchema = SchemaFactory.createForClass(Vacation);
