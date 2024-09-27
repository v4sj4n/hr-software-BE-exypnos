import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose'; // Import Connection
import { Conversation } from '../interfaces/conversation.interface';
import { Message } from '../interfaces/message.interface';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { InjectConnection } from '@nestjs/mongoose'; // Import InjectConnection
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectConnection() private readonly connection: Connection,
    private eventEmitter: EventEmitter2, 
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    console.log('Creating a new conversation:', createConversationDto.participants);

    const existingConversation = await this.conversationModel
      .findOne({
        participants: { $all: createConversationDto.participants, $size: createConversationDto.participants.length },
      })
      .exec();

    if (existingConversation) {
      console.log('Conversation already exists:', existingConversation._id);
      return existingConversation;
    }

    const conversation = new this.conversationModel(createConversationDto);
    try {
      const savedConversation = await conversation.save();
      console.log('New conversation created:', savedConversation._id);

      // Emit event after creating the conversation
      this.eventEmitter.emit('conversation.created', { conversation: savedConversation });

      return savedConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
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
      console.log('Creating conversation with participants:', createConversationDto.participants);
  
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
        console.log('New conversation created:', conversation._id);
  
        this.eventEmitter.emit('conversation.created', { conversation });
      } else {
        console.log('Conversation already exists:', conversation._id);
  
      }
  
      createMessageDto.conversationId = conversation._id as string;
      const message = new this.messageModel(createMessageDto);
      await message.save({ session });
      console.log('First message created with ID:', message._id);
  
      await session.commitTransaction();
      session.endSession();
  
      return { conversation, message };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction failed:', error);
      throw new Error('Failed to create conversation and message: ' + error.message);
    }
  }
  

  async findAll(): Promise<Conversation[]> {
    try {
      const conversations = await this.conversationModel.find().exec();
      console.log('Retrieved all conversations');
      return conversations;
    } catch (error) {
      console.error('Failed to retrieve conversations:', error);
      throw new Error('Failed to retrieve conversations: ' + error.message);
    }
  }

  async findById(id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationModel.findById(id).exec();
      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
      console.log(`Conversation retrieved: ${id}`);
      return conversation;
    } catch (error) {
      console.error('Failed to retrieve conversation:', error);
      throw new Error('Failed to retrieve conversation: ' + error.message);
    }
  }

  async findByUser(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await this.conversationModel.find({ participants: userId }).exec();
      console.log(`Conversations retrieved for user: ${userId}`);
      return conversations;
    } catch (error) {
      console.error('Failed to retrieve conversations for user:', error);
      throw new Error('Failed to retrieve conversations for user: ' + error.message);
    }
  }

  async findMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      const messages = await this.messageModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
      if (!messages || messages.length === 0) {
        this.logger.warn(`No messages found for conversation ID: ${conversationId}`);
        return [];
      }
      this.logger.log(`Messages retrieved for conversation ID: ${conversationId}`);
      return messages;
    } catch (error) {
      this.logger.error(`Failed to retrieve messages for conversation ID: ${conversationId}`, error.stack);
      throw new Error('Failed to retrieve messages: ' + error.message);
    }
  }
}
