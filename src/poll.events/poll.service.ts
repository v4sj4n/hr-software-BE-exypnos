import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../common/schema/event.schema';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class PollService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async vote(eventId: string, voteDto: VoteDto): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const option = event.poll.options.find((o) => o.option === voteDto.option);
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

  async updateVote(eventId: string, voteDto: VoteDto): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    // Find the option the user has already voted for
    const currentOption = event.poll.options.find((o) =>
      o.voters.includes(voteDto.userId),
    );
    if (!currentOption) {
      throw new NotFoundException(`User has not voted yet`);
    }

    // Find the new option to vote for
    const newOption = event.poll.options.find(
      (o) => o.option === voteDto.option,
    );
    if (!newOption) {
      throw new NotFoundException(`Option ${voteDto.option} not found`);
    }

    // Remove the user's vote from the current option
    currentOption.votes--;
    currentOption.voters = currentOption.voters.filter(
      (id) => id !== voteDto.userId,
    );

    // Add the user's vote to the new option
    newOption.votes++;
    newOption.voters.push(voteDto.userId);

    await event.save();
    return event;
  }

  async deleteVote(eventId: string, voteDto: VoteDto): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    // Find the option the user has voted for
    const option = event.poll.options.find((o) =>
      o.voters.includes(voteDto.userId),
    );
    if (!option) {
      throw new NotFoundException(`User has not voted for any option`);
    }

    // Remove the user's vote
    option.votes--;
    option.voters = option.voters.filter((id) => id !== voteDto.userId);

    await event.save();
    return event;
  }
}
