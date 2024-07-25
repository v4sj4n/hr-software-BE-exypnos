import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;
export class PollOption {
  @Prop({ required: true })
  option: string;

  @Prop({ default: 0 })
  votes: number;

  @Prop({ type: [String], default: [] })
  voters: string[];

  @Prop({ default: false })
  isDeleted: boolean;
}
export class Poll {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [PollOption], default: [] })
  options: PollOption[];
}

@Schema()
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Poll, required: false })
  poll?: Poll;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
