import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import muv from 'mongoose-unique-validator';
import { Role } from 'src/common/enum/role.enum';
import { GradeType, PositionType } from '../enum/position.enum';

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})
export class User {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ default: Role.DEV, enum: Role, type: String })
  role: Role;

  @Prop({ required: true })
  phone: string;

  @Prop({
    default:
      'https://firebasestorage.googleapis.com/v0/b/exypnos-63ca1.appspot.com/o/userImages%2Fdefault.jpg?alt=media',
    type: String,
  })
  imageUrl: string | null;

  @Prop({ default: null, type: String })
  gender: string | null;

  @Prop({ default: null, type: String })
  dob: string | null;

  @Prop({ default: null, type: String })
  pob: string | null;

  @Prop({ required: true, unique: true, ref: 'Auth' })
  auth: Types.ObjectId;

  @Prop({ required: false, enum: PositionType, type: String })
  position: PositionType;

  @Prop({ required: false, enum: GradeType, type: String })
  grade: GradeType;

  @Prop({ default: false, type: Boolean })
  isDeleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

// Ensure unique validation on specific fields (like email in the Auth schema)
UserSchema.plugin(muv);

export { UserSchema };
