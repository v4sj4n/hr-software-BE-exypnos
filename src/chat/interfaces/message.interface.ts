import { Document } from 'mongoose';

export interface Message extends Document {
  conversationId: string;
  content: string;
  sender: string;
  timestamp: Date;
}
