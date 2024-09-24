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
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle({ short: true, medium: true, long: true })
@WebSocketGateway({
  cors: {
    origin: 'https://seashell-app-rvw8f.ondigitalocean.app/',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('sendMessage')
  handleMessage(
    client: Socket,
    payload: { sender: string; message: string },
  ): void {
    console.log(payload);
    this.server.emit('receiveMessage', payload);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
