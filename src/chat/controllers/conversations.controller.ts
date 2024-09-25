import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // Create a new conversation
  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    console.log(createConversationDto); // Log the incoming request body
    return this.conversationsService.createConversation(createConversationDto);
  }

  // Get all conversations
  @Get()
  async findAll() {
    return this.conversationsService.findAll();
  }

  // Get a conversation by ID
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }

  // Get all conversations by user ID
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.conversationsService.findByUser(userId);
  }

  // Get all messages for a specific conversation
  @Get(':conversationId/messages')
  async findMessagesByConversation(
    @Param('conversationId') conversationId: string,
  ) {
    console.log(`Fetching messages for conversation ID: ${conversationId}`);
    return this.conversationsService.findMessagesByConversation(conversationId);
  }
}
