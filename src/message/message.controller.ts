import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // POST /messages - Save a new message
  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    const { senderId, recipientId, message } = createMessageDto;
    return this.messageService.saveMessage(senderId, recipientId, message);
  }

  // GET /messages/recipient/:recipientId - Get messages by recipientId
  @Get('recipient/:recipientId')
  async getMessagesByRecipient(@Param('recipientId') recipientId: string) {
    console.log('Received recipientId:', recipientId);
    return this.messageService.getMessagesByRecipient(recipientId);
  }

  // GET /messages/sender/:senderId - Get messages by senderId
  @Get('sender/:senderId')
  async getMessagesBySender(@Param('senderId') senderId: string) {
    console.log('Received senderId:', senderId);
    return this.messageService.getMessagesBySender(senderId);
  }

  // GET /messages/:senderId/:recipientId - Get messages between two users
  @Get(':senderId/:recipientId')
  async getMessages(
    @Param('senderId') senderId: string,
    @Param('recipientId') recipientId: string,
  ) {
    console.log('Query senderId:', senderId);
    console.log('Query recipientId:', recipientId);
    return this.messageService.getMessages(senderId, recipientId);
  }
}