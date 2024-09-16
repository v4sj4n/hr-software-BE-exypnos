import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../common/schema/user.schema';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { paginate } from 'src/common/util/pagination';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  // Fetch all users with pagination
  async findAll(page?: number, limit?: number): Promise<User[]> {
    try {
      if (!limit && !page) {
        return await this.userModel
          .find({ isDeleted: { $ne: true } })
          .populate('auth', 'email');
      }
      const filter = { isDeleted: { $ne: true } };
      const populate = { path: 'auth', select: 'email' };
      const sort = { createdAt: -1 };
      return paginate(page, limit, this.userModel, filter, sort, populate);
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  // Find a single user by ID
  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).populate('auth');
    if (!user || user.isDeleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // Update user by ID
  async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );
      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return updatedUser;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  // Soft-delete a user by setting isDeleted to true
  async deleteUser(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
  }

  // Upload a profile image and update the user with the image URL
  async uploadImage(file: Express.Multer.File, req: any): Promise<string> {
    try {
      const profileImageUrl = await this.firebaseService.uploadFile(
        file,
        'profileImages',
        'square',
      );

      await this.userModel.findByIdAndUpdate(req['user'].sub, {
        imageUrl: profileImageUrl,
      });

      return profileImageUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new ConflictException('Failed to upload file');
    }
  }

  // Filter users by first name
  async filterUsers(name: string): Promise<User[]> {
    try {
      const users = await this.userModel.find({
        firstName: { $regex: name, $options: 'i' },
        isDeleted: { $ne: true },
      });
      return users;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  // Get users by position
  async getUserByPosition(position: string): Promise<User[]> {
    try {
      const users = await this.userModel
        .find({
          position,
          isDeleted: false,
        })
        .select('firstName lastName');
      return users;
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
