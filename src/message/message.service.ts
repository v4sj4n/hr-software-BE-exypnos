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

  private validateObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  async saveMessage(senderId: string, recipientId: string, message: string) {
    const senderObjectId = this.validateObjectId(senderId);
    const recipientObjectId = this.validateObjectId(recipientId);

    const newMessage = new this.messageModel({
      senderId: senderObjectId,
      recipientId: recipientObjectId,
      message,
      timestamp: new Date(),
    });

    try {
      return await newMessage.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error saving message: ${error.message}`,
      );
    }
  }

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
}
