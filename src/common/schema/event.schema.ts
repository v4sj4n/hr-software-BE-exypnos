import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class PollOption {
  @Prop({ required: true, type: String })
  option: string;

  @Prop({ default: 0, type: Number })
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

  @Prop({ type: String, default: 'Tirana' })
  location: string;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, default: 'Tirana' })
  location: string;

  @Prop({ type: Poll, required: false })
  poll?: Poll;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
