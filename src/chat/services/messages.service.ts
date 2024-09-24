import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../interfaces/message.interface';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  // Create a new message
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);
    return message.save();
  }

  // Retrieve all messages in a conversation
  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.messageModel.find({ conversationId }).exec();
  }
}
