import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from 'src/common/schema/project.schema';
import { User } from 'src/common/schema/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
    private ratingService: RatingsService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      createProjectDto.projectManager = new Types.ObjectId(
        createProjectDto.projectManager,
      );
      createProjectDto.teamMembers = createProjectDto.teamMembers.map(
        (id) => new Types.ObjectId(id),
      );
      await this.validateUserIds(createProjectDto.teamMembers);
      await this.validateUserIds([createProjectDto.projectManager]);
      const createdProject = new this.projectModel(createProjectDto);
      await createdProject.save();
      await this.ratingService.createRatingForTeamMember({
        projectId: createdProject._id,
        userId: createdProject.projectManager,
        raterId: createdProject.projectManager,
        productivityScore: 1,
        teamCollaborationScore: 1,
        technicalSkillLevel: 1,
        clientFeedbackRating: 1,
      });
      for (let i = 0; i < createProjectDto.teamMembers.length; i++) {
        await this.ratingService.createRatingForTeamMember({
          projectId: createdProject._id,
          userId: createProjectDto.teamMembers[i],
          raterId: createdProject.projectManager,
          productivityScore: 1,
          teamCollaborationScore: 1,
          technicalSkillLevel: 1,
          clientFeedbackRating: 1,
        });
      }
      return createdProject;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      return this.projectModel.find({ isDeleted: false });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectModel.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    try {
      const existingProject = await this.projectModel.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!existingProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (updateProjectDto.teamMembers) {
        await this.validateUserIds(updateProjectDto.teamMembers);
      }
      if (updateProjectDto.projectManager) {
        await this.validateUserIds([updateProjectDto.projectManager]);
      }
      const updatedProject = await this.projectModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          ...updateProjectDto,
        },
        { new: true },
      );
      return updatedProject;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async remove(id: string): Promise<Project> {
    try {
      const deletedProject = await this.projectModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      );

      if (!deletedProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return deletedProject;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async getStructure(): Promise<Project[]> {
    try {
      return this.projectModel
        .find({ isDeleted: false }, { projectManager: 1, teamMembers: 1 })
        .populate('projectManager', 'firstName lastName position grade')
        .populate('teamMembers', 'firstName lastName position grade');
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async validateUserIds(userIds: Types.ObjectId[]) {
    for (let i = 0; i < userIds.length; i++) {
      const user = await this.userModel.findOne({
        _id: userIds[i],
        isDeleted: false,
      });
      if (!user) {
        throw new BadRequestException(`User with ID ${userIds[i]} not found`);
      }
      if (user.position === 'hr') {
        throw new BadRequestException(
          `User with ID ${userIds[i]} cannot be assigned to a project`,
        );
      }
      if (userIds[i] === userIds[i + 1]) {
        throw new BadRequestException('Users IDs must be unique');
      }
    }
  }

  async getTeamMembers(userId: string): Promise<String[]> {
    try {
      const project = await this.projectModel.find({
        projectManager: new Types.ObjectId(userId),
        isDeleted: false,
      });
      let teamMembers = [];
      for (let i = 0; i < project.length; i++) {
        for (let j = 0; j < project[i].teamMembers.length; j++) {
          if (!teamMembers.includes(project[i].teamMembers[j].toString())) {
            teamMembers.push(project[i].teamMembers[j].toString());
          }
        }
      }
      return teamMembers;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
