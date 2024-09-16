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
  import { MessageService } from './message/message.service'; // Example: Service for persisting messages
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
    },
  })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');
  
    constructor(private readonly messageService: MessageService) {}
  
    // Fix for missing 'afterInit' method
    afterInit(server: Server): void {
      this.logger.log('WebSocket Initialized');
    }
  
    handleConnection(client: Socket): void {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket): void {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('register')
    async handleRegister(client: Socket, userId: string): Promise<void> {
      this.logger.log(`User registered: ${userId} with socketId: ${client.id}`);
    }
  
    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(@MessageBody() data: { senderId: string; recipientId: string; message: string }): Promise<void> {
      this.logger.log(`Private message from ${data.senderId} to ${data.recipientId}: ${data.message}`);
      await this.messageService.saveMessage(data.senderId, data.recipientId, data.message);
    }
  
    @SubscribeMessage('fetchMessages')
    async handleFetchMessages(client: Socket, { senderId, recipientId }: { senderId: string; recipientId: string }): Promise<void> {
      const messages = await this.messageService.getMessages(senderId, recipientId);
      client.emit('messageHistory', messages);
    }
  }
  