import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './services/conversations.service';
import { MessagesService } from './services/messages.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Conversation } from './interfaces/conversation.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './interfaces/message.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      client.join(roomId);
      console.log(`Client ${client.id} joined room ${roomId}`);
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      client.leave(roomId);
      console.log(`Client ${client.id} left room ${roomId}`);
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received sendMessage event:', createMessageDto);
    try {
      const savedMessage = await this.messagesService.createMessage(createMessageDto);
      console.log(`Message created: ${savedMessage._id}`);

      // Broadcast the message to the conversation room
      this.server
        .to(createMessageDto.conversationId)
        .emit('receiveMessage', savedMessage);
      console.log(
        `Message broadcasted to room ${createMessageDto.conversationId}`,
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Listen for conversation.created event
  @OnEvent('conversation.created')
  handleConversationCreated(payload: { conversation: Conversation; message?: Message }) {
    const { conversation } = payload;
    const participantIds = conversation.participants;

    participantIds.forEach((participantId) => {
      // Emit the newConversation event to the participant's personal room
      this.server.to(participantId).emit('newConversation', conversation);

      // Have each participant join the new conversation room
      this.server.to(participantId).emit('joinRoom', conversation._id);
    });
  }
}
