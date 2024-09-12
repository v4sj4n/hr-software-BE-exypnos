import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating } from 'src/common/schema/rating.schema';
import { Project } from 'src/common/schema/project.schema';
import { User } from 'src/common/schema/user.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<Rating>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createRatingForTeamMember(
    createRatingDto: CreateRatingDto,
  ): Promise<Rating> {
    const project = await this.projectModel.findOne({
      _id: createRatingDto.projectId,
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }
    const user = await this.userModel.findOne({ _id: createRatingDto.userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const rating = new this.ratingModel(createRatingDto);
    return await rating.save();
  }
  async updateRating(id: string, updateRatingDto: UpdateRatingDto) {
    const rating = await this.ratingModel.findById(id);
    if (!rating) {
      throw new BadRequestException('Rating not found');
    }
    return await this.ratingModel.findByIdAndUpdate(id, updateRatingDto, {
      new: true,
    });
  }
  async findByUser(userId?: string, averageRating?: boolean) {
    if (userId) {
      const userObjectId = new Types.ObjectId(userId);
      return this.ratingModel
        .find({ userId: userObjectId })
        .populate('projectId', 'name');
    }
    if (averageRating) {
      return await this.userModel.aggregate([
        {
          $lookup: {
            from: 'ratings',
            localField: '_id',
            foreignField: 'userId',
            as: 'ratings',
          },
        },
        {
          $unwind: {
            path: '$ratings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            position: { $first: '$position' },
            grade: { $first: '$grade' },
            clientFeedbackRating: { $avg: '$ratings.clientFeedbackRating' },
            productivityScore: { $avg: '$ratings.productivityScore' },
            teamCollaborationScore: { $avg: '$ratings.teamCollaborationScore' },
            technicalSkillLevel: { $avg: '$ratings.technicalSkillLevel' },
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            position: 1,
            grade: 1,
            averageRating: {
              $round: [
                {
                  $avg: [
                    { $ifNull: ['$clientFeedbackRating', 0] },
                    { $ifNull: ['$productivityScore', 0] },
                    { $ifNull: ['$teamCollaborationScore', 0] },
                    { $ifNull: ['$technicalSkillLevel', 0] },
                  ],
                },
                2,
              ],
            },
          },
        },
      ]);
    }
  }
}
