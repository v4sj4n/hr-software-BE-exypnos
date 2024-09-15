import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Request } from 'express';
import { MessagesService } from 'src/messages/message.service';
import { User } from 'src/common/schema/user.schema';  // Import the correct User schema

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getMessages() {
    return this.messagesService.getMessages();  // Fetch all messages with user data
  }

  @UseGuards(AuthGuard)
  @Post()
  async sendMessage(@Body() body: { content: string }, @Req() req: Request) {
    const user: User = req.user as User;  // Correct the typing of 'user' to 'User'
    const { content } = body;
    return this.messagesService.sendMessage(user, content);
  }
}
