// src/common/schema/message.schema.ts
import { Schema, Document, model, Types } from 'mongoose';
import { User } from 'src/common/schema/user.schema';

export interface IMessage extends Document {
  content: string;
  sender: Types.ObjectId | User;
  recipient: Types.ObjectId | User;
  createdAt: Date;
}

export const MessageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = model<IMessage>('Message', MessageSchema);
