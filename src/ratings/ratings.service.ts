import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating } from 'src/common/schema/rating.schema';
import { Project } from 'src/common/schema/project.schema';
import { User } from 'src/common/schema/user.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

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
    const { projectId, userId ,raterId} = createRatingDto;
    const project = await this.projectModel.findOne({ _id: projectId });
    if (!project) {
      throw new BadRequestException('Project not found');
    }
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const rater = await this.userModel.findOne({_id: raterId});
    if (!rater) {
      throw new BadRequestException('Rater not found');
    }

    const isTeamMember = project.teamMembers.some((memberId) =>
      memberId.equals(user._id),
    );
    const isProjectManager = project.projectManager.equals(rater._id);
    if (!isTeamMember) {
      throw new BadRequestException('Team member is not part of the project');
    }
    if (!isProjectManager) {
      throw new BadRequestException('Rater is not the project manager');
    }
    const rating =  new this.ratingModel(createRatingDto);

    return await rating.save();
  }
  async updateRating(id: string, updateRatingDto: CreateRatingDto) {
    return this.ratingModel.findByIdAndUpdate(id, updateRatingDto, {
      new: true,
    });
  }
  async findByUserId(userId: string, averageRating: boolean) {
    const userObjectId = new Types.ObjectId(userId);
    
    if (averageRating) {
      return this.ratingModel.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            averageProductivity: { $avg: '$productivityScore' },
            averageTeamCollaboration: { $avg: '$teamCollaborationScore' },
            averageTechnicalSkill: { $avg: '$technicalSkillLevel' },
            averageClientFeedback: { $avg: '$clientFeedbackRating' }
          }
        },
        {
          $project: {
            _id: 0,
            overallAverage: {
              $round: [{
                $avg: [
                  '$averageProductivity',
                  '$averageTeamCollaboration',
                  '$averageTechnicalSkill',
                  '$averageClientFeedback'
                ]
              }, 2]
            }
          }
        }
      ]);
    }
    
    return this.ratingModel
      .find({ userId: userObjectId })
      .populate('projectId', 'name');
  }

  async findByProjectId(projectId: string) {
    const projectObjectId = new Types.ObjectId(projectId);
    return this.ratingModel.find({ projectId: projectObjectId });
  }
}
