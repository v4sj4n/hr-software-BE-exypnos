// src/messages/messages.controller.ts
import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Request } from 'express';
import { MessagesService } from 'src/messages/message.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard)
  @Post()
  async sendMessage(@Body() body: { recipientId: string; content: string }, @Req() req: Request) {
    const senderId = req.user._id.toString();  // Convert ObjectId to string
    const { recipientId, content } = body;
    return this.messagesService.sendMessage(senderId, recipientId, content);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  findByUserId(
    @Query('userId') userId: string,  // Get user ID from query parameters
  ) {
    return this.messagesService.findMessagesForUser(userId);
  }
}
