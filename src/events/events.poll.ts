import {
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { Event, PollOption } from '../common/schema/event.schema';
  import { VoteDto } from './dto/vote.dto';
    import { validateData } from './events.utils';



  async function addVote(id: string, vote: VoteDto): Promise<Event> {
    await validateData(id, vote);
    const event = await this.eventModel.findById(id);
    const user = await this.userModel.findById(vote.userId);

    for (const option of event.poll.options) {
      const existingVoter = option.voters.find(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      );
      if (existingVoter) {
        var existingVote = option.option;
      }
    }
    if (existingVote && !event.poll.isMultipleVote) {
      await this.eventModel.findOneAndUpdate(
        { _id: id, 'poll.options.option': existingVote },
        {
          $inc: { 'poll.options.$.votes': -1 },
          $pull: {
            'poll.options.$.voters': {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          },
        },
        { new: true },
      );
    }
    const option = event.poll.options.find((opt) => opt.option === vote.option);
    if (
      option.voters.some(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      )
    ) {
      throw new ConflictException('User has already voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': 1 },
        $addToSet: {
          'poll.options.$.voters': {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      },
      { new: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with id ${id} or option not found`);
    }

    return updatedEvent;
  }

  async function removeVote(id: string, vote: VoteDto): Promise<Event> {
    await validateData(id, vote);
    const event = await this.eventModel.findById(id);
    const option = event.poll.options.find((opt) => opt.option === vote.option);
    const user = await this.userModel.findById(vote.userId);

    if (
      !option.voters.some(
        (voter) =>
          voter._id.toString() === user._id.toString() &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      )
    ) {
      throw new ConflictException('User has not voted for this option');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, 'poll.options.option': vote.option },
      {
        $inc: { 'poll.options.$.votes': -1 },
        $pull: {
          'poll.options.$.voters': {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      },
      { new: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with id ${id} or option not found`);
    }

    return updatedEvent;
  }

  async function getEventPollResults(id: string): Promise<PollOption[]> {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (!event.poll || !event.poll.options) {
      throw new BadRequestException('This event does not have a poll');
    }
    return event.poll.options;
  }

  async function geOtptionThatUserVotedFor(id: string, userId: string): Promise<number> {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (!event.poll || !event.poll.options) {
      throw new BadRequestException('This event does not have a poll');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const votedOption = event.poll.options.find((opt) =>
      opt.voters.some(
        (voter) =>
          voter._id.toString() === userId &&
          voter.firstName === user.firstName &&
          voter.lastName === user.lastName,
      ),
    );
    return votedOption ? event.poll.options.indexOf(votedOption) + 1 : -1;
  }


  export{addVote,removeVote,getEventPollResults,geOtptionThatUserVotedFor}