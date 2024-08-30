import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from 'src/common/schema/rating.schema';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
@Post()
create(@Body() createRatingDto: CreateRatingDto, @Req() req: Request & { user: any }): Promise<Rating> {
  const currentUser = req.user; // Assuming req.user is populated by authentication middleware
  return this.ratingsService.create(createRatingDto, currentUser);
}

  @Get()
  findAll(): Promise<Rating[]> {
    return this.ratingsService.findAll();
  }

  @Get(':userId')
  findByUserId(@Param('userId') userId: string): Promise<Rating[]> {
    return this.ratingsService.findByUserId(new Types.ObjectId(userId));
  }

  @Get('project/:projectId')
  findByProjectId(@Param('projectId') projectId: string): Promise<Rating[]> {
    return this.ratingsService.findByProjectId(new Types.ObjectId(projectId));
  }

  @Get('id/:id')
  findById(@Param('id') id: string): Promise<Rating> {
    return this.ratingsService.findById(new Types.ObjectId(id));
  }
}
