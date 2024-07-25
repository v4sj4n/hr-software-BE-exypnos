import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as muv from 'mongoose-unique-validator';

@Schema({
  timestamps: true,
})
export class Auth {
  @Prop({ required: true, unique: true, sparse: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.plugin(muv);
export { AuthSchema };
