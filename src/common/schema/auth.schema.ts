import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import muv from 'mongoose-unique-validator';

@Schema({
  timestamps: true,
})
export class Auth extends Document {
  @Prop({ required: true, unique: true, sparse: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isDeleted: boolean;

  // New properties for password reset
  @Prop({ type: String, default: null })
  passwordResetToken?: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpires?: Date | null;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.plugin(muv);
