import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Role {
  CEO = 'ceo',
  HR = 'hr',
  PM = 'pm',
  DEV = 'dev',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ required: true })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
