import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';

interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
}

@Controller()
export class ChatController {
  private chatStream$ = new Subject<ChatMessage>();

  @GrpcStreamMethod('ChatService', 'ChatStream')
  chatStream(messages: Observable<ChatMessage>): Observable<ChatMessage> {
    messages.subscribe({
      next: (message: ChatMessage) => {
        console.log(`[${message.user}]: ${message.message}`);
        message.timestamp = Date.now();
        this.chatStream$.next(message);
      },
      complete: () => console.log('Stream completed'),
    });

    return this.chatStream$.asObservable();
  }
}
