import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/common/schema/message.schema';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  // Save a new message to the database
  async saveMessage(senderId: string, recipientId: string, message: string) {
    const newMessage = new this.messageModel({
      senderId,
      recipientId,
      message,
      timestamp: new Date(),  // Add a timestamp for when the message is saved
    });

    try {
      return await newMessage.save();  // Save the message and return it
    } catch (error) {
      throw new InternalServerErrorException(`Error saving message: ${error.message}`);
    }
  }

  // Get messages between two users
  async getMessages(senderId: string, recipientId: string) {
    try {
      return await this.messageModel
        .find({
          $or: [
            { senderId, recipientId },
            { senderId: recipientId, recipientId: senderId },
          ],
        })
        .sort({ timestamp: 1 })  // Sort by timestamp in ascending order
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error retrieving messages: ${error.message}`);
    }
  }
}
