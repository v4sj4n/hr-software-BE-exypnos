import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: false, type: String })
  date: Date;

  @Prop({ default: false, type: Boolean })
  willBeReminded: boolean;

  @Prop({ default: false, type: Boolean })
  isDeleted: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
