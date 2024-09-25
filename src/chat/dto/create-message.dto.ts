import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  text: string;

  @IsString()
  senderId: string;
}
