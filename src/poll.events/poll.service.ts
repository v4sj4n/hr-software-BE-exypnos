import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll, PollDocument } from '../common/schema/poll.schema'
import { CreatePollDto } from './dto/create-poll.dto';

@Injectable()
export class PollService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
  ) {}

  async create(createPollDto: CreatePollDto): Promise<Poll> {
    const createdPoll = new this.pollModel(createPollDto);
    return createdPoll.save();
  }

  async findAll(): Promise<Poll[]> {
    return this.pollModel.find().exec();
  }

  async findOne(id: string): Promise<Poll> {
    const poll = await this.pollModel.findById(id).exec();
    if (!poll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }
    return poll;
  }

  async update(id: string, createPollDto: CreatePollDto): Promise<Poll> {
    const updatedPoll = await this.pollModel.findByIdAndUpdate(id, createPollDto, { new: true }).exec();
    if (!updatedPoll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }
    return updatedPoll;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pollModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }
  }
}
