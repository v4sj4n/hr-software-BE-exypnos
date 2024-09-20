import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private activeUsers = new Map<string, Set<string>>(); 

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: { senderId: string; recipientId: string; message: string }): void {
    console.log('Message received:', payload);

    const recipientSocketIds = this.activeUsers.get(payload.recipientId);

    if (recipientSocketIds) {
      recipientSocketIds.forEach((socketId) => {
        console.log(`Sending message to ${payload.recipientId} at socket ${socketId}`);
        this.server.to(socketId).emit('receiveMessage', payload); // Send message to all recipient's sockets
      });
    } else {
      console.log(`Recipient ${payload.recipientId} is not connected`);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId; 

    if (userId) {
      if (!this.activeUsers.has(userId as string)) {
        this.activeUsers.set(userId as string, new Set());
      }

      this.activeUsers.get(userId as string)?.add(client.id); 
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } else {
      this.logger.warn(`Connection attempt without userId: socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.activeUsers.entries()].find(
      ([, socketIds]) => socketIds.has(client.id)
    )?.[0];

    if (userId) {
      const socketIds = this.activeUsers.get(userId);
      if (socketIds) {
        socketIds.delete(client.id); 
        if (socketIds.size === 0) {
          this.activeUsers.delete(userId);
        }
        this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
      }
    } else {
      this.logger.warn(`Disconnection of socket ${client.id} not linked to any user`);
    }
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Initialized');
  }
}
