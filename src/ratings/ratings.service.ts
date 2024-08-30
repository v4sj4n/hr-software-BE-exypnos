// src/ratings/ratings.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating } from 'src/common/schema/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Project } from 'src/common/schema/project.schema';
import { User } from 'src/common/schema/user.schema';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createRatingDto: CreateRatingDto, currentUser: User): Promise<Rating> {
    await this.validateData(createRatingDto, currentUser);
    const createdRating = new this.ratingModel(createRatingDto);
    return createdRating.save();
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingModel.find().exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<Rating[]> {
    return this.ratingModel.find({ userId }).exec();
  }

  async findByProjectId(projectId: Types.ObjectId): Promise<Rating[]> {
    return this.ratingModel.find({ projectId }).exec();
  }

  async findById(id: Types.ObjectId): Promise<Rating> {
    return this.ratingModel.findById(id).exec();
  }

  private async validateData(createRatingDto: CreateRatingDto, currentUser: User) {
    const { userId, projectId } = createRatingDto;

    // Validate rating scores
    if (
      createRatingDto.productivityScore < 1 ||
      createRatingDto.productivityScore > 5 ||
      createRatingDto.teamCollaborationScore < 1 ||
      createRatingDto.teamCollaborationScore > 5 ||
      createRatingDto.technicalSkillLevel < 1 ||
      createRatingDto.technicalSkillLevel > 5 ||
      createRatingDto.clientFeedbackRating < 1 ||
      createRatingDto.clientFeedbackRating > 5
    ) {
      throw new BadRequestException('Invalid rating scores');
    }

    // Validate project existence
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Validate user existence
    const userBeingRated = await this.userModel.findById(userId).exec();
    if (!userBeingRated) {
      throw new BadRequestException('User not found');
    }

    // Ensure the user being rated is a team member of the project
    if (!project.teamMembers.includes(userId)) {
      throw new BadRequestException('The user being rated is not a team member of this project');
    }

    // Prevent self-rating
if (currentUser.id.toString() === userId.toString()) {
      throw new BadRequestException('You cannot rate yourself');
    }
  }
}
