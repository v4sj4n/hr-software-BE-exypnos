import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async createRating(@Body() createRatingDto: CreateRatingDto) {
    const rating = await this.ratingsService.createRatingForTeamMember(createRatingDto);
    return {
      message: 'Rating created successfully',
      rating,
    };
  }
  @Get('user/:id')
  findByUserId(@Param('id') id: string) {
    return this.ratingsService.findByUserId(id);
  }
}
