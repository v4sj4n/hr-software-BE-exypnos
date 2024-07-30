import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { Poll, PollSchema } from '../common/schema/poll.schema';
import { Event, EventSchema } from '../common/schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [PollController],
  providers: [PollService],
})
export class PollModule {}
