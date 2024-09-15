import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './message.service';
import { MessagesController } from './message.controller';
import { Message, MessageSchema } from 'src/common/schema/message.schema';
import { User, UserSchema } from 'src/common/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
