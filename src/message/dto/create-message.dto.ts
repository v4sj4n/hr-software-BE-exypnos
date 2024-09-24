import { IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsString()
  conversationId: Types.ObjectId; // Conversation ID to associate the message with

  @IsString()
  senderId: Types.ObjectId; // ID of the user sending the message

  @IsString()
  text: string; // The message content
}
