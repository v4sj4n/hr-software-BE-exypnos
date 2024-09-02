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
  ) {}

  async createRatingForTeamMember(createRatingDto: CreateRatingDto): Promise<Rating> {
    const { projectId, userId } = createRatingDto;

    console.log('Received userId:', userId);  // Debugging line

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Ensure userId is converted to ObjectId if necessary
    const userObjectId = new Types.ObjectId(userId);

    // Query the database for the project using the string projectId
    const project = await this.projectModel.findOne({ _id: projectId }).exec();

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Log the retrieved teamMembers array and userId
    console.log('Project teamMembers:', project.teamMembers);

    // Check if the userId exists in the teamMembers array
    const isTeamMember = project.teamMembers.some(
      memberId => memberId.equals(userObjectId)
    );

    if (!isTeamMember) {
      throw new BadRequestException('Team member is not part of the project');
    }

    // Proceed with creating the rating if the validation passes
    const rating = new this.ratingModel({
      userId: userObjectId,
      projectId: project._id,
      productivityScore: createRatingDto.productivityScore,
      teamCollaborationScore: createRatingDto.teamCollaborationScore,
      technicalSkillLevel: createRatingDto.technicalSkillLevel,
      clientFeedbackRating: createRatingDto.clientFeedbackRating,
    });

    return await rating.save();
  }
 async findByUserId(userId: string) {
   const userObjectId = new Types.ObjectId(userId);
    return this.ratingModel.find({ userId: userObjectId }).exec();
  }
}