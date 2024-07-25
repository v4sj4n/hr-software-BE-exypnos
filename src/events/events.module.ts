import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from '../common/schema/event.schema';
import { PollModule } from '../poll.events/poll.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    PollModule,
    NotificationModule
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
