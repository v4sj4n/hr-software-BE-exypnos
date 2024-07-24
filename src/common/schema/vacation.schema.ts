import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { VacationType } from '../enum/vacation.enum';
import { User } from './user.schema';

@Schema({
  timestamps: true,
})
export class Vacation {
  @Prop({ required: true, enum: VacationType })
  type: VacationType;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  userId: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const VacationSchema = SchemaFactory.createForClass(Vacation);
