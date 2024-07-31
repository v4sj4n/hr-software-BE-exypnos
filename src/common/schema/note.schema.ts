import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: false, type: Date })
  date: Date;

  @Prop({ default: false, type: Boolean })
  willBeReminded: boolean;

  @Prop({ default: false, type: Boolean })
  isDeleted: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
