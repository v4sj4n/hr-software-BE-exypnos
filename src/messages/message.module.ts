import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';  // Import MongooseModule
import { MessagesService } from 'src/messages/message.service';  // Ensure correct service import
import { MessagesController } from 'src/messages/message.controller';  // Ensure correct controller import
import { Message, MessageSchema } from 'src/common/schema/message.schema';  // Import Mongoose schema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),  // Use Mongoose for MongoDB
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
