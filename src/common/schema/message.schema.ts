// src/messages/message.schema.ts
import { Schema, Document, model, Types } from 'mongoose';
import { User } from 'src/common/schema/user.schema';  // Assuming you have a Mongoose User schema

// Define the Message document interface
export interface IMessage extends Document {
  content: string;
  user: Types.ObjectId | User;  // Reference to the User model
  createdAt: Date;
}

// Define the Mongoose schema for Message
export const MessageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },  // Reference to User schema
  createdAt: { type: Date, default: Date.now },  // Auto-create timestamp for message creation
});

// Create and export the Mongoose model
export const Message = model<IMessage>('Message', MessageSchema);
