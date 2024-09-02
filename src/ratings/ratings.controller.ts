import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from 'src/common/schema/rating.schema';
import { Types } from 'mongoose';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}


  Controller
  @Post()
  async createRating(@Body() createRatingDto: CreateRatingDto) {
    const rating = await this.ratingsService.createRatingForTeamMember(createRatingDto);
    return {
      message: 'Rating created successfully',
      rating,
    };
  }

    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() updateRatingDto: UpdateRatingDto,
    ): Promise<Rating> {
      const objectId = new Types.ObjectId(id);  // Convert id to ObjectId
      return this.ratingsService.update(objectId.toHexString(), updateRatingDto);
    }
  }