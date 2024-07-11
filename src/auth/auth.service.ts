import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/signin-user.dto';
import { InjectModel } from '@nestjs/mongoose';

type IUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
      return this.userModel.create(createUserDto);
    } catch (err) {
      throw new ConflictException(err);
    }
  }
  async signIn(
    signInUserDto: SignInUserDto,
  ): Promise<{ message: string; data: { access_token: string; user: IUser } }> {
    try {
      const user = await this.userModel.findOne({ email: signInUserDto.email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(
        signInUserDto.password,
        user.password,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
      };

      return {
        message: 'Authenticated Succesfully',
        data: {
          access_token: await this.jwtService.signAsync(payload),
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          },
        },
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
