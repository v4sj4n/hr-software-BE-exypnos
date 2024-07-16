import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { Poll, PollSchema } from '../schemas/poll.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }])],
  controllers: [PollController],
  providers: [PollService],
})
export class PollModule {}
