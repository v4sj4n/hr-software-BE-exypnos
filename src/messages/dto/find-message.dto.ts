// src/messages/dto/find-messages.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class FindMessagesDto {
  @IsOptional()
  @IsString()
  userId?: string;  // Optional parameter to search for messages by user ID
}
