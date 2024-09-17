import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages') // Base route for all message-related requests
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // POST /messages - Save a new message
  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    const { senderId, recipientId, message } = createMessageDto;
    return this.messageService.saveMessage(senderId, recipientId, message);
  }

  // GET /messages/:senderId/:recipientId - Get messages between two users
  @Get(':senderId/:recipientId')
  async getMessages(
    @Param('senderId') senderId: string,
    @Param('recipientId') recipientId: string,
  ) {
    return this.messageService.getMessages(senderId, recipientId);
  }
}



