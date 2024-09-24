import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from 'src/common/schema/message.schema';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  // Fetch messages from a specific conversation
  async getMessagesByConversation(conversationId: Types.ObjectId): Promise<Message[]> {
    return this.messageModel.find({ conversationId }).exec();  // Find all messages for this conversation
  }
}
