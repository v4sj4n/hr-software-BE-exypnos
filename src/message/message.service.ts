import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from 'src/common/schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Validate ObjectId
  private validateObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  // Get messages between two users where either can be the sender or the recipient
  async getMessages(senderId: string, recipientId: string) {
    console.log('Query senderId:', senderId);
    console.log('Query recipientId:', recipientId);

    const senderObjectId = this.validateObjectId(senderId);
    const recipientObjectId = this.validateObjectId(recipientId);

    try {
      const messages = await this.messageModel
        .find({
          $or: [
            { senderId: senderObjectId, recipientId: recipientObjectId },
            { senderId: recipientObjectId, recipientId: senderObjectId },
          ],
        })
        .sort({ timestamp: 1 })
        .exec();

      console.log('Found messages:', messages);

      if (!messages || messages.length === 0) {
        return { message: 'No messages found between these users.' };
      }

      return messages;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving messages: ${error.message}`,
      );
    }
  }

  // Get messages sent by a specific sender
  async getMessagesBySender(senderId: string) {
    const senderObjectId = this.validateObjectId(senderId);

    try {
      const messages = await this.messageModel
        .find({ senderId: senderObjectId })
        .sort({ timestamp: 1 })
        .exec();

      if (!messages || messages.length === 0) {
        return { message: 'No messages found for this sender.' };
      }

      return messages;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving messages for sender: ${error.message}`,
      );
    }
  }

  // Get messages received by a specific recipient
  async getMessagesByRecipient(recipientId: string) {
    const recipientObjectId = this.validateObjectId(recipientId);

    try {
      const messages = await this.messageModel
        .find({ recipientId: recipientObjectId })
        .sort({ timestamp: 1 })
        .exec();

      if (!messages || messages.length === 0) {
        return { message: 'No messages found for this recipient.' };
      }

      return messages;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving messages for recipient: ${error.message}`,
      );
    }
  }

  async isExistingConversation(
    senderId: string,
    recipientId: string,
  ): Promise<boolean> {
    const senderObjectId = this.validateObjectId(senderId);
    const recipientObjectId = this.validateObjectId(recipientId);

    // Debugging log to check IDs
    console.log(
      'Checking conversation between:',
      senderObjectId,
      recipientObjectId,
    );

    const existingMessages = await this.messageModel.findOne({
      $or: [
        { senderId: senderObjectId, recipientId: recipientObjectId },
        { senderId: recipientObjectId, recipientId: senderObjectId },
      ],
    });

    // Log the query result
    console.log('Existing messages:', existingMessages);

    return !!existingMessages;
  }

  // Save a new message to the database and return whether it's a new chat
  async saveMessage(
    senderId: string,
    recipientId: string,
    message: string,
  ): Promise<{ newChat: boolean }> {
    const senderObjectId = this.validateObjectId(senderId);
    const recipientObjectId = this.validateObjectId(recipientId);

    const isExisting = await this.isExistingConversation(senderId, recipientId); // Check if the conversation exists

    const newMessage = new this.messageModel({
      senderId: senderObjectId,
      recipientId: recipientObjectId,
      message,
      timestamp: new Date(),
    });

    try {
      await newMessage.save();
      return { newChat: !isExisting }; // If no existing conversation, return newChat: true
    } catch (error) {
      throw new InternalServerErrorException(
        `Error saving message: ${error.message}`,
      );
    }
  }
}
