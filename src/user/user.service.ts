import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

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

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    console.log(user);
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const res = await this.userModel.create(createUserDto);
    return res;
  }
  async deleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }
}
