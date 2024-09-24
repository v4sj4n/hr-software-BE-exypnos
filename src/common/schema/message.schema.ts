import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId; // Links the message to a conversation

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; // Links the message to the sender

  @Prop({ type: String, required: true })
  text: string; // The content of the message

  @Prop({ type: Date, default: Date.now })
  createdAt: Date; // Automatically handled by Mongoose

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date; // Automatically handled by Mongoose
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ senderId: 1 });
