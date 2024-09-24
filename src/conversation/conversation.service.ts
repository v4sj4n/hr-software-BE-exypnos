import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from 'src/common/schema/conversation.schema';
import { CreateConversationDto } from './conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async createConversation(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const createdConversation = new this.conversationModel(
      createConversationDto,
    );
    return createdConversation.save();
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({
        participants: userId,
      })
      .exec();
  }
}
