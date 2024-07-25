import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PollService } from './poll.service';
import { VoteDto } from './dto/vote.dto';

@Controller('event')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post(':eventId/vote')
  vote(@Param('eventId') eventId: string, @Body() voteDto: VoteDto) {
    return this.pollService.vote(eventId, voteDto);
  }

  @Patch(':eventId/vote')
  updateVote(@Param('eventId') eventId: string, @Body() voteDto: VoteDto) {
    return this.pollService.updateVote(eventId, voteDto);
  }

  @Delete(':eventId/vote')
  deleteVote(@Param('eventId') eventId: string, @Body() voteDto: VoteDto) {
    return this.pollService.deleteVote(eventId, voteDto);
  }
}
