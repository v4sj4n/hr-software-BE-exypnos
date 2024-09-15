// src/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, IMessage } from 'src/common/schema/message.schema';  // Import the Message model
import { User } from 'src/common/schema/user.schema';  // Import the Mongoose User schema

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<IMessage>,  // Inject the Message model
  ) {}

  // Fetch all messages, including the user who sent them
  async getMessages(): Promise<IMessage[]> {
    return this.messageModel.find().populate('user').sort({ createdAt: 'asc' }).exec();  // Fetch with user info
  }

  // Save a new message to the database
  async sendMessage(user: User, content: string): Promise<IMessage> {
    const message = new this.messageModel({ user, content });
    return message.save();
  }
}
