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
  UploadedFile,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { VoteDto } from './dto/vote.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

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
  findAll() {
    return this.eventsService.findAll();
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
    return this.eventsService.geOtptionThatUserVotedFor(id, userId);
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
