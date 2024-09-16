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
      timestamp: new Date(), // Add a timestamp for when the message is saved
    });

    try {
      return await newMessage.save(); // Save the message and return it
    } catch (error) {
      throw new InternalServerErrorException(`Error saving message: ${error.message}`);
    }
  }

  // Get messages between two users where either can be the sender or the recipient
  async getMessages(senderId: string, recipientId: string) {
    try {
      const messages = await this.messageModel
        .find({
          $or: [
            { senderId, recipientId }, // Case where the logged-in user is the sender
            { senderId: recipientId, recipientId: senderId }, // Case where the logged-in user is the recipient
          ],
        })
        .sort({ timestamp: 1 }) // Sort by timestamp in ascending order
        .exec();

      // If no messages are found, return an empty array
      if (!messages || messages.length === 0) {
        return { message: 'No messages found between these users.' };
      }

      return messages;
    } catch (error) {
      throw new InternalServerErrorException(`Error retrieving messages: ${error.message}`);
    }
  }
}
