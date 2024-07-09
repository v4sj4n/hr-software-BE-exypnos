import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  async createUser(user: User): Promise<User> {
    const res = this.userModel.create(user);
    return res;
  }
}
