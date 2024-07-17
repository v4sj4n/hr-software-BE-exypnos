import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { Poll } from '../common/schema/poll.schema';

@Controller('polls')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  create(@Body() createPollDto: CreatePollDto): Promise<Poll> {
    return this.pollService.create(createPollDto);
  }

  @Get()
  findAll(): Promise<Poll[]> {
    return this.pollService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Poll> {
    return this.pollService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createPollDto: CreatePollDto,
  ): Promise<Poll> {
    return this.pollService.update(id, createPollDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.pollService.remove(id);
  }
}
