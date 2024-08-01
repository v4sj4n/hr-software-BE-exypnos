import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from '../common/schema/event.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { User, UserSchema } from 'src/common/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
