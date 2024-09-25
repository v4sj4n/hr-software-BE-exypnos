import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // When a user joins a conversation room
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: string, 
    @ConnectedSocket() client: Socket // Get the individual socket instance
  ) {
    client.join(conversationId); // The socket joins the room
    console.log(`Client ${client.id} joined room ${conversationId}`);
  }

  // When a message is sent
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto
  ) {
    const message = await this.chatService.saveMessage(createMessageDto);
    // Send the message to all clients in the room (conversationId)
    this.server.to(createMessageDto.conversationId).emit('receiveMessage', message);
  }
}
