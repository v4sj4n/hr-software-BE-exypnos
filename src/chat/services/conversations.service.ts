import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose'; 
import { Conversation } from '../interfaces/conversation.interface';
import { Message } from '../interfaces/message.interface';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { InjectConnection } from '@nestjs/mongoose'; 
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectConnection() private readonly connection: Connection,
    private eventEmitter: EventEmitter2, 
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const existingConversation = await this.conversationModel
      .findOne({
        participants: { $all: createConversationDto.participants, $size: createConversationDto.participants.length },
      })
      .exec();

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel(createConversationDto);
    try {
      const savedConversation = await conversation.save();
      this.eventEmitter.emit('conversation.created', { conversation: savedConversation });
      return savedConversation;
    } catch (error) {
      throw new Error('Failed to create conversation: ' + error.message);
    }
  }

  async createConversationAndFirstMessage(
    createConversationDto: CreateConversationDto,
    createMessageDto: CreateMessageDto,
  ): Promise<{ conversation: Conversation; message: Message }> {
    const session = await this.connection.startSession();
    session.startTransaction();
  
    try {
      let conversation = await this.conversationModel
        .findOne({
          participants: {
            $all: createConversationDto.participants,
            $size: createConversationDto.participants.length,
          },
        })
        .session(session)
        .exec();
  
      if (!conversation) {
        conversation = new this.conversationModel(createConversationDto);
        await conversation.save({ session });
        this.eventEmitter.emit('conversation.created', { conversation });
      }
  
      createMessageDto.conversationId = conversation._id as string;
      const message = new this.messageModel(createMessageDto);
      await message.save({ session });
  
      await session.commitTransaction();
      session.endSession();
  
      return { conversation, message };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error('Failed to create conversation and message: ' + error.message);
    }
  }
  
  async findAll(): Promise<Conversation[]> {
    try {
      return await this.conversationModel.find().exec();
    } catch (error) {
      throw new Error('Failed to retrieve conversations: ' + error.message);
    }
  }

  async findById(id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationModel.findById(id).exec();
      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
      return conversation;
    } catch (error) {
      throw new Error('Failed to retrieve conversation: ' + error.message);
    }
  }

  async findByUser(userId: string): Promise<Conversation[]> {
    try {
      return await this.conversationModel.find({ participants: userId }).exec();
    } catch (error) {
      throw new Error('Failed to retrieve conversations for user: ' + error.message);
    }
  }

  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      const messages = await this.messageModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
      if (!messages || messages.length === 0) {
        return [];
      }
      return messages;
    } catch (error) {
      throw new Error('Failed to retrieve messages: ' + error.message);
    }
  }
}
