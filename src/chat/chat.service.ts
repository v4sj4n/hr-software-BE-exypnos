import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, ReplaySubject } from 'rxjs';
import { Inject } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';


interface ChatService {
  chatStream(upstream: Observable<ChatMessage>): Observable<ChatMessage>;
}

interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
}

@Injectable()
export class AppService implements OnModuleInit {
  private chatService: ChatService;

  constructor(@Inject('CHAT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatService>('ChatService');
  }

  startChat(user: string): Observable<ChatMessage> {
    const messageStream$ = new ReplaySubject<ChatMessage>();

    // Simulate sending messages
    messageStream$.next({ user, message: 'Hello!', timestamp: Date.now() });
    messageStream$.next({ user, message: 'How are you?', timestamp: Date.now() });

    // Set gRPC deadline (5 seconds from now)
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 5);

    // Return gRPC call with error handling
    return new Observable(observer => {
      const chatStream = this.chatService.chatStream(messageStream$).subscribe({
        next: (response) => observer.next(response),
        error: (err) => {
          if (err.code === grpc.status.DEADLINE_EXCEEDED) {
            console.error('Request timed out');
          } else {
            console.error(`An error occurred: ${err.message}`);
          }
          observer.error(err);
        },
        complete: () => observer.complete(),
      });

      return () => chatStream.unsubscribe();
    });
  }
}
