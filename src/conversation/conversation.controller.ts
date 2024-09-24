import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.createConversation(createConversationDto);
  }

  @Get(':userId')
  async getConversationsByUser(@Param('userId') userId: string) {
    return this.conversationService.getConversationsByUser(userId);
  }
}
