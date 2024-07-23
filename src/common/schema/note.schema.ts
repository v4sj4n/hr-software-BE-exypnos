import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false,default: new Date() })
  date: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);