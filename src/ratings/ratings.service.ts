import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating } from 'src/common/schema/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Project } from 'src/common/schema/project.schema';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<Rating>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,  // Inject Project model
  ) {}

  async createRatingForTeamMember(createRatingDto: CreateRatingDto): Promise<Rating> {
    const { projectId, teamMemberId, productivityScore, teamCollaborationScore, technicalSkillLevel, clientFeedbackRating } = createRatingDto;

    // Validate if the team member is part of the project
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const isTeamMember = project.teamMembers.some(memberId => memberId.toString() === teamMemberId);
    if (!isTeamMember) {
      throw new BadRequestException('Team member is not part of the project');
    }

    // Create the rating if the validation passes
    const rating = new this.ratingModel({
      userId: new Types.ObjectId(teamMemberId),
      projectId: new Types.ObjectId(projectId),
      productivityScore,
      teamCollaborationScore,
      technicalSkillLevel,
      clientFeedbackRating,
    });

    return await rating.save();
  }
}