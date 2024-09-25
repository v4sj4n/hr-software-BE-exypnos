import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './services/conversations.service';
import { CreateMessageDto } from './dto/create-message.dto'; // Assuming you have a DTO for messages
import { MessagesService } from './services/messages.service'; // Assuming you have a service to handle messages
import { CreateConversationDto } from './dto/create-conversation.dto';

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
    private readonly messagesService: MessagesService, // Assuming a service for handling messages
  ) {}

  // Join a room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined room ${conversationId}`);
  }

  // Handle creating a conversation (Already exists in your code)
  @SubscribeMessage('createConversation')
  async handleCreateConversation(
    @MessageBody() createConversationDto: CreateConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const savedConversation = await this.conversationsService.createConversation(createConversationDto);
    console.log(`Conversation created: ${savedConversation._id}`);

    // Notify all users about the new conversation
    this.server.emit('newConversation', savedConversation);
  }

  // Handle sending a message
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto, // Assuming a DTO for message creation
    @ConnectedSocket() client: Socket,
  ) {
    // Save the message in the database
    const savedMessage = await this.messagesService.createMessage(createMessageDto);
    console.log(`Message created: ${savedMessage._id}`);

    // Broadcast the message to the users in the conversation room
    this.server.to(createMessageDto.conversationId).emit('receiveMessage', savedMessage);
    console.log(`Message broadcasted to room ${createMessageDto.conversationId}`);
  }
}
