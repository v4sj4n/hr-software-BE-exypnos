import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './services/conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './services/messages.service';

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
  

  @SubscribeMessage('createConversation')
  async handleCreateConversation(
    @MessageBody() createConversationDto: CreateConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received createConversation event:', createConversationDto);
    try {
      const savedConversation =
        await this.conversationsService.createConversation(
          createConversationDto,
        );
      console.log(`Conversation created: ${savedConversation._id}`);

      // Notify participants of the new conversation using their user ID rooms
      createConversationDto.participants.forEach((participantId) => {
        console.log(
          `Attempting to emit newConversation event to participant: ${participantId}`,
        );

        // Emit the new conversation event
        this.server
          .to(participantId)
          .emit('newConversation', savedConversation);

        // Have each participant join the new conversation room
        this.server.to(participantId).emit('joinRoom', savedConversation._id);
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received sendMessage event:', createMessageDto);
    try {
      const savedMessage =
        await this.messagesService.createMessage(createMessageDto);
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
}
