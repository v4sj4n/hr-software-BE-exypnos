import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}
  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find();
      return users;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(id);

      return user;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
    try {
      Object.keys(updateUserDto).forEach((element) => {
        if (
          ![
            'firstName',
            'lastName',
            'password',
            'email',
            'role',
            'phone',
          ].includes(element)
        ) {
          throw new ConflictException('Invalid field');
        }
      });
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
      await this.userModel.findByIdAndDelete(id);
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
