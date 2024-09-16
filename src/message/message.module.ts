import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { Message, MessageSchema } from 'src/common/schema/message.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  providers: [MessageService],
  exports: [MessageService], // Export MessageService so it can be used in other modules
})
export class MessageModule {}
