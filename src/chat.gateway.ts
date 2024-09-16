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
  
  @WebSocketGateway({
    cors: {
      origin: '*', // Allow cross-origin requests
    },
  })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');
  
    afterInit(server: Server): void {
      this.logger.log('WebSocket Initialized');
    }
  
    handleConnection(client: Socket, ...args: any[]): void {
      this.logger.log(`Client connected: ${client.id}`);
      this.server.emit('users', { id: client.id, message: 'A new user has connected!' });
    }
  
    handleDisconnect(client: Socket): void {
      this.logger.log(`Client disconnected: ${client.id}`);
      this.server.emit('users', { id: client.id, message: 'A user has disconnected!' });
    }
  
    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: { sender: string; message: string }): void {
      this.logger.log(`Message from ${data.sender}: ${data.message}`);
      this.server.emit('message', data);
    }
  }
  