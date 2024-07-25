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
  @Prop({ default: Role.DEV, enum: Role })
  role: Role;
  @Prop({ required: true })
  phone: string;
  @Prop({
    default:
      'https://firebasestorage.googleapis.com/v0/b/exypnos-63ca1.appspot.com/o/userImages%2Fdefault.jpeg?alt=media',
  })
  imageUrl: string | null;

  @Prop({ default: null })
  gender: string | null;

  @Prop({ default: null })
  dob: string | null;

  @Prop({ default: null })
  pob: string | null;

  @Prop({ required: true, unique: true, ref: 'Auth' })
  auth: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(muv);
export { UserSchema };
