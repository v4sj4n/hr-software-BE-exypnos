import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../interfaces/conversation.interface';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
  ) {}

  // Create a new conversation
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const conversation = new this.conversationModel(createConversationDto);
    return conversation.save();
  }

  // Retrieve all conversations
  async findAll(): Promise<Conversation[]> {
    return this.conversationModel.find().exec();
  }

  // Retrieve a conversation by ID
  async findById(conversationId: string): Promise<Conversation> {
    return this.conversationModel.findById(conversationId).exec();
  }

  // Retrieve conversations by user ID
  async findByUser(userId: string): Promise<Conversation[]> {
    return this.conversationModel.find({ participants: userId }).exec();
  }
}
