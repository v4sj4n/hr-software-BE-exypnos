import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating, RatingSchema } from 'src/common/schema/rating.schema';
import { ProjectModule } from 'src/project/project.module';  

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    ProjectModule, 
  ],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
