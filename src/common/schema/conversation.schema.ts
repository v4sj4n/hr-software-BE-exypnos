import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: [String] })
  participants: string[];

  @Prop()
  lastMessage: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
