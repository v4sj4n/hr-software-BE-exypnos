import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PollOptionDocument = PollOption & Document;

@Schema()
export class PollOption {
  @Prop({ required: true })
  option: string;

  @Prop({ default: 0 })
  votes: number;

  @Prop({ type: [String], default: [] })
  voters: string[];
}

export const PollOptionSchema = SchemaFactory.createForClass(PollOption);
