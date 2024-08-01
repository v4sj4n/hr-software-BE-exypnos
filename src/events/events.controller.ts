import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { VoteDto } from './dto/vote.dto';

@Controller('event')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }
  @Get('poll')
  getEventPollResults(@Param('id') id: string) {
    return this.eventsService.getEventPollResults(id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  partialUpdate(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/vote')
  addVote(@Param('id') id: string, @Body() voteDto: VoteDto) {
    return this.eventsService.addVote(id, voteDto);
  }

  @Delete(':id/vote')
  removeVote(@Param('id') id: string, @Body() voteDto: VoteDto) {
    return this.eventsService.removeVote(id, voteDto);
  }
}
