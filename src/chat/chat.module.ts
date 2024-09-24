import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ConversationsService } from './services/conversations.service';
import { MessagesService } from './services/messages.service';
import { ConversationSchema } from './schemas/conversation.schema';
import { MessageSchema } from './schemas/message.schema';
import { ConversationsController } from './controllers/conversations.controller';
import { MessagesController } from './controllers/messages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Message', schema: MessageSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService, ConversationsService, MessagesService],
  controllers: [ConversationsController, MessagesController],
  exports: [ChatService], 
})
export class ChatModule {}
