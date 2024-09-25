import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../interfaces/message.interface';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  // Create a new message
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);
    try {
      const savedMessage = await message.save();
      this.logger.log(`Message created: ${savedMessage._id}`);
      return savedMessage;
    } catch (error) {
      this.logger.error('Failed to create message', error.stack);
      throw new Error('Failed to create message: ' + error.message);
    }
  }

  // Retrieve all messages in a conversation
  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      // Add sorting by createdAt (ascending)
      const messages = await this.messageModel
        .find({ conversationId })
        .sort({ createdAt: 1 }) // Order by createdAt in ascending order
        .exec();

      // Check if the array is empty
      if (!messages || messages.length === 0) {
        this.logger.warn(`No messages found for conversation ID: ${conversationId}`);
        throw new NotFoundException(`No messages found for conversation with ID: ${conversationId}`);
      }

      this.logger.log(`Messages retrieved for conversation ID: ${conversationId}`);
      return messages;
    } catch (error) {
      this.logger.error(`Failed to retrieve messages for conversation ID: ${conversationId}`, error.stack);
      throw new Error('Failed to retrieve messages: ' + error.message);
    }
  }
}
