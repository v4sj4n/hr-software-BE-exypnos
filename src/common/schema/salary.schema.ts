import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Salary {
  static uniqueId(arg0: string, uniqueId: any) {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true, type: 'number' })
  amount: number;

  @Prop({ default: 'ALL', type: String })
  currency: string;

  @Prop({ default: 0, type: 'number' })
  bonus: number;

  @Prop({ default: 0, type: 'number' })
  month: number;

  @Prop({ default: 0, type: 'number' })
  year: number;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
  })
  userId: Types.ObjectId;

  @Prop({ type: 'string' })
  uniqueId: string;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);
