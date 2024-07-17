import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PollOption, PollOptionSchema } from './poll-option.schema';

export type PollDocument = Poll & Document;

@Schema()
export class Poll {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [PollOptionSchema], default: [] })
  options: PollOption[];
}

export const PollSchema = SchemaFactory.createForClass(Poll);
