import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../interfaces/message.interface';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Conversation } from '../interfaces/conversation.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectModel('Conversation')
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { conversationId, senderId, text } = createMessageDto;

    if (!conversationId || !senderId || !text) {
      throw new BadRequestException(
        'conversationId, senderId, and text are required to create a message.',
      );
    }

    const conversation = await this.conversationModel
      .findById(conversationId)
      .exec();
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found.`,
      );
    }

    const message = new this.messageModel(createMessageDto);
    try {
      const savedMessage = await message.save();
      return savedMessage;
    } catch (error) {
      throw new Error('Failed to create message: ' + error.message);
    }
  }

  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      const messages = await this.messageModel
        .find({ conversationId })
        .sort({ createdAt: 1 })
        .exec();

      if (!messages || messages.length === 0) {
        return [];
      }

      return messages;
    } catch (error) {
      throw new Error('Failed to retrieve messages: ' + error.message);
    }
  }
}
