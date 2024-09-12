import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import muv from 'mongoose-unique-validator';

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})
export class Auth {
  @Prop({ required: true, unique: true, sparse: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ default: false, type: Boolean })
  isDeleted: boolean;

  // New fields for reset password functionality

  // Stores the token for resetting the password
  @Prop({ type: String, default: null })
  resetPasswordToken: string;

  // Stores the expiration time for the reset password token
  @Prop({ type: Number, default: null })
  resetPasswordExpires: number;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

// Apply the unique validator plugin to handle unique fields like email
AuthSchema.plugin(muv);

export { AuthSchema };
