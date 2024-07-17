import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import * as muv from 'mongoose-unique-validator';
import { Role } from 'src/common/enum/role.enum';
@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop({ required: true, enum: Role })
  role: Role;
  @Prop({ required: true })
  phone: string;
  @Prop({ default: null })
  imageUrl: string | null;

  @Prop({ default: null })
  gender: string | null;

  @Prop({ default: null })
  dob: string | null;

  @Prop({ default: null })
  pob: string | null;

  @Prop({ required: true, unique: true })
  userId: Types.ObjectId;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(muv);
export { UserSchema };
