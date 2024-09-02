import { ConflictException, Injectable } from '@nestjs/common';
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
  async findAll(page?: number, limit?: number): Promise<User[]> {
    try {
      if (!limit && !page) {
        return await this.userModel.find({ isDeleted: { $ne: true } });
      }
      const filter = { isDeleted: { $ne: true } };
      const populate = { path: 'auth', select: 'email' };
      const sort = { createdAt: -1 };
      const user = paginate(
        page,
        limit,
        this.userModel,
        filter,
        sort,
        populate,
      );
      return user;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).populate('auth');
    if (!user || user.isDeleted) {
      throw new ConflictException(`User with id ${id} not found`);
    }
    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );
      return updatedUser;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userModel.findById(id);
    } catch (err) {
      throw new ConflictException(err);
    }
    await this.userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
  }

  async uploadImage(file: Express.Multer.File, req: Request): Promise<string> {
    try {
      const profileImageUrl = await this.firebaseService.uploadFile(
        file,
        'cv',
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
