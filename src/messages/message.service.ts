// src/messages/messages.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMessage } from 'src/common/schema/message.schema';
import { User } from 'src/common/schema/user.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<IMessage>,  // Ensure 'Message' is correctly injected
    @InjectModel('User') private readonly userModel: Model<User>,  // Ensure 'User' is correctly injected
  ) {}

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<IMessage> {
    const sender = await this.userModel.findById(senderId);
    const recipient = await this.userModel.findById(recipientId);

    if (!sender || !recipient) {
      throw new BadRequestException('Sender or recipient not found');
    }

    const message = new this.messageModel({
      sender: new Types.ObjectId(senderId),
      recipient: new Types.ObjectId(recipientId),
      content,
    });

    return await message.save();
  }

  async findMessagesForUser(userId: string): Promise<IMessage[]> {
    return this.messageModel
      .find({ recipient: new Types.ObjectId(userId) })
      .populate('sender', 'firstName lastName')
      .exec();
  }
}
