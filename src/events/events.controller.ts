import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { VoteDto } from './dto/vote.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('event')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 10 }]))
  async create(
    @UploadedFiles()
    files: { photo?: Express.Multer.File[] },
    @Body() createEventDto: CreateEventDto,
  ) {
    const photo = files?.photo || [];
    return await this.eventsService.create(photo, createEventDto);
  }

  @Get()
  findAll(@Query('search') search: string = '') {
    return this.eventsService.findAll(search);
  }

  @Get('poll/:id')
  getEventPollResults(@Param('id') id: string) {
    return this.eventsService.getEventPollResults(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/user/:userId')
  getEventsByUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.eventsService.getOptionThatUserVotedFor(id, userId);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 10 }]))
  partialUpdate(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[] },
  ) {
    const photo = files?.photo || [];
    return this.eventsService.update(id, updateEventDto, photo);
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