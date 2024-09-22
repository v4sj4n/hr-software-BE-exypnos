import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private activeUsers: Map<string, Set<string>> = new Map(); // Map userId to a set of socket IDs
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly messageService: MessageService) {}

  // Handle sending messages
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { senderId: string; recipientId: string; message: string }
  ): Promise<void> {
    const { newChat } = await this.messageService.saveMessage(
      payload.senderId,
      payload.recipientId,
      payload.message
    );

    // Emit the message to the recipient's socket(s)
    const recipientSockets = this.activeUsers.get(payload.recipientId);
    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        this.server.to(socketId).emit('receiveMessage', payload);
      });

      // If this is a new chat, emit the newActiveChat event to the recipient's sockets
      if (newChat) {
        recipientSockets.forEach((socketId) => {
          this.server.to(socketId).emit('newActiveChat', {
            senderId: payload.senderId,
          });
        });
      }
    }
  }

  // Track active users when they connect
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Get the set of socket IDs for this user or create a new one
      let socketSet = this.activeUsers.get(userId);
      if (!socketSet) {
        socketSet = new Set();
        this.activeUsers.set(userId, socketSet);
      }

      // Add the new socket ID to the set
      socketSet.add(client.id);
      this.logger.log(`Client connected: ${client.id} (User ID: ${userId})`);
    }
  }

  // Remove users' socket IDs on disconnect
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.activeUsers.entries()).find(([key, value]) =>
      value.has(client.id)
    )?.[0];

    if (userId) {
      const socketSet = this.activeUsers.get(userId);
      if (socketSet) {
        socketSet.delete(client.id); // Remove the disconnected socket ID

        // If the user has no active sockets left, remove them from active users
        if (socketSet.size === 0) {
          this.activeUsers.delete(userId);
        }
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Initialize the WebSocket server
  afterInit(server: Server) {
    this.logger.log('WebSocket Initialized');
  }
}
