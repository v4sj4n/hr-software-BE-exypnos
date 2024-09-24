import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { Types } from 'mongoose';

@Controller('conversations/:conversationId/messages') // Ensure this is correct
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // GET /conversations/:conversationId/messages
  @Get()
  async getMessagesByConversation(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessagesByConversation(new Types.ObjectId(conversationId));
  }
}
