import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('rating')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async createRating(@Body() createRatingDto: CreateRatingDto) {
    const rating =
      await this.ratingsService.createRatingForTeamMember(createRatingDto);
    return {
      message: 'Rating created successfully',
      rating,
    };
  }
  @Patch(':id')
  async updateRating(
    @Param('id') id: string,
    @Body() updateRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.updateRating(id, updateRatingDto);
  }

  @Get('user')
  findByUserId(
    @Query('id') id: string,
    @Query('avarageRating') avarageRating: boolean,
  ) {
    return this.ratingsService.findByUser(id, avarageRating);
  }

  @Get('project/:id')
  findByProjectId(@Param('id') id: string) {
    return this.ratingsService.findByProjectId(id);
  }
}
