import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../interfaces/conversation.interface';
import { Message } from '../interfaces/message.interface';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
    @InjectModel('Message') private readonly messageModel: Model<Message>, // Assuming you're using a Message model
  ) {}

  // Create a new conversation or return an existing one
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    // Check if a conversation with the same participants already exists
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: createConversationDto.participants, $size: createConversationDto.participants.length },
    }).exec();

    if (existingConversation) {
      this.logger.log(`Conversation already exists: ${existingConversation._id}`);
      return existingConversation; // Return the existing conversation
    }

    // Create a new conversation if it doesn't exist
    const conversation = new this.conversationModel(createConversationDto);
    try {
      const savedConversation = await conversation.save();
      this.logger.log(`New conversation created: ${savedConversation._id}`);
      return savedConversation;
    } catch (error) {
      this.logger.error('Failed to create conversation', error.stack);
      throw new Error('Failed to create conversation: ' + error.message);
    }
  }

  // Retrieve all conversations
  async findAll(): Promise<Conversation[]> {
    return this.conversationModel.find().exec();
  }

  // Retrieve a conversation by its ID
  async findById(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }
    return conversation;
  }

  // Retrieve all conversations by user ID (where the user is a participant)
  async findByUser(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationModel.find({ participants: userId }).exec();
    if (!conversations || conversations.length === 0) {
      throw new NotFoundException(`No conversations found for user with ID ${userId}`);
    }
    return conversations;
  }

  // Retrieve all messages for a specific conversation by its ID
  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    const messages = await this.messageModel.find({ conversationId }).exec();
    if (!messages || messages.length === 0) {
      throw new NotFoundException(`No messages found for conversation with ID ${conversationId}`);
    }
    return messages;
  }
}
