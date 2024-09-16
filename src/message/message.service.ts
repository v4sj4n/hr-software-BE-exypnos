import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/common/schema/message.schema';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async saveMessage(senderId: string, recipientId: string, message: string) {
    const newMessage = new this.messageModel({ senderId, recipientId, message });
    return newMessage.save();
  }

  async getMessages(senderId: string, recipientId: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();
  }
}
