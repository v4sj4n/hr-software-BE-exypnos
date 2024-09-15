// src/chat/chat.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body('content') content: string,
    @Body('senderId') senderId: number,
  ) {
    return this.chatService.createMessage(content, senderId);
  }

  @Get('messages')
  async getMessages() {
    return this.chatService.getMessages();
  }
}
