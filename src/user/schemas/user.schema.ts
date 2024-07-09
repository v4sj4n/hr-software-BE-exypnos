import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  // @Prop({ enum: Role })
  // role: Role;
}

// export enum Role {
//   CEO = 'ceo',
//   HR = 'hr',
//   DEV = 'dev',
// }

export const UserSchema = SchemaFactory.createForClass(User);
