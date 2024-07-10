import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import mongoose from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
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

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      Object.keys(createUserDto).forEach((element) => {
        if (
          ![
            'firstName',
            'lastName',
            'email',
            'password',
            'role',
            'phone',
          ].includes(element)
        ) {
          throw new ConflictException('Invalid field');
        }
      });

      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      createUserDto.password = hashedPassword;

      const res = await this.userModel.create(createUserDto);
      return res;
    } catch (err) {
      console.log(err);
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

  async findUser(signInUserDto: SignInUserDto) {
    try {
      const user = await this.userModel.findOne({ email: signInUserDto.email });

      if (!user) {
        throw new ConflictException('User not found');
      }

      const isMatch = await bcrypt.compare(
        signInUserDto.password,
        user.password,
      );

      if (!isMatch) {
        throw new ConflictException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };

      return {
        message: 'Authenticated Succesfully',
        data: {
          access_token: await this.jwtService.signAsync(payload),
        },
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
