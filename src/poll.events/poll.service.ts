import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../common/schema/event.schema';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class PollService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async vote(eventId: string, voteDto: VoteDto): Promise<Event> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const option = event.poll.options.find(o => o.option === voteDto.option);
    if (!option) {
      throw new NotFoundException(`Option ${voteDto.option} not found`);
    }

    // Check if the user has already voted for this option
    if (option.voters.includes(voteDto.userId)) {
      throw new BadRequestException('User has already voted for this option');
    }

    option.votes++;
    option.voters.push(voteDto.userId);

    await event.save();
    return event;
  }
}
