import { Controller, Post, Body } from '@nestjs/common';
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
}
