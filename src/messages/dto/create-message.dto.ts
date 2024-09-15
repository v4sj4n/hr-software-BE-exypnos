// src/messages/dto/create-message.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;  // The ID of the recipient

  @IsString()
  @IsNotEmpty()
  content: string;  // The content of the message
}
