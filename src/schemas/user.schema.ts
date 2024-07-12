import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as muv from 'mongoose-unique-validator';
import { Role } from 'src/enum/role.enum';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ required: true })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User).plugin(muv);
