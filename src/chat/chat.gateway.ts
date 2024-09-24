import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
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

@SubscribeMessage('joinConversation')
handleJoinConversation(@MessageBody() conversationId: string) {
    (this.server as any).join(conversationId);
}

@SubscribeMessage('sendMessage')
async handleMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.chatService.saveMessage(createMessageDto);
    this.server.to(createMessageDto.conversationId).emit('receiveMessage', message);
}
}
