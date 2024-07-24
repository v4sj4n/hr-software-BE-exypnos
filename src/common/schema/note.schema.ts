import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  date: Date;

  @Prop({ default: false })
  willBeReminded: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
