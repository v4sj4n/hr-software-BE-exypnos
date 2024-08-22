import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Salary {
  @Prop({ required: true, type: 'number' })
  netSalary: number;

  @Prop({ required: true, type: 'number' })
  workingDays: number;

  @Prop({ default: 'ALL', type: String })
  currency: string;

  @Prop({ default: 0, type: 'number' })
  bonus: number;

  @Prop({ default: '', type: 'string' })
  bonusDescription: string;

  @Prop({ default: 0, type: 'number' })
  socialSecurity: number;

  @Prop({ default: 0, type: 'number' })
  healthInsurance: number;

  @Prop({ default: 0, type: 'number' })
  tax: number;

  @Prop({ default: 0, type: 'number' })
  grossSalary: number;

  @Prop({ required: true, type: 'number' })
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
