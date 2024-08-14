import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { User } from '../common/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/signin-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { generateRandomPassword } from 'src/common/util/generateRandomPassword';
import { Auth } from 'src/common/schema/auth.schema';
import { MailService } from 'src/mail/mail.service';

type IUser = User & { email: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(Auth.name) private authModel: mongoose.Model<Auth>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, ...userProperties } = createUserDto;

      const password = generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const existingAuth = await this.authModel.findOne({ email });
      if (existingAuth) {
        throw new ConflictException('Email already exists');
      }

      const userAuth = await this.authModel.create({
        email,
        password: hashedPassword,
      });

      console.log(password);
      const user = await this.userModel.create({
        ...userProperties,
        auth: userAuth._id,
      });

      await this.mailService.sendMail({
        to: createUserDto.email,
        subject: 'Mireseerdhe ne Codevider',
        template: 'welcome',
        context: {
          name: createUserDto.firstName + ' ' + createUserDto.lastName,
          email: createUserDto.email,
          password,
        },
      });
      return user;
    } catch (err) {
      throw new ConflictException(err);
    }
  }
  async signIn(signInUserDto: SignInUserDto): Promise<{
    message: string;
    data: { access_token: string; user: IUser };
  }> {
    try {
      const userAuth = await this.authModel.findOne({
        email: signInUserDto.email,
      });
      const user = await this.userModel.findOne({ auth: userAuth._id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(
        signInUserDto.password,
        userAuth.password,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: userAuth.email,
        role: user.role,
      };

      return {
        message: 'Authenticated Succesfully',
        data: {
          access_token: await this.jwtService.signAsync(payload),

          user: {
            ...user.toObject(),
            email: signInUserDto.email,
          },
        },
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getUser(email: string): Promise<IUser> {
    try {
      const userAuth = await this.authModel.findOne({
        email,
      });
      const user = await this.userModel.findOne({
        auth: userAuth._id,
      });
      return {
        ...user.toObject(),
        email,
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, email: string) {
    try {
      const user = await this.authModel.findOne({ email });

      const isMatch = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Invalid old password');
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);
      user.save();
      return 'Password updated succesfully';
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async removeUser(email: string) {
    try {
      await this.authModel.findOneAndUpdate(
        { email },
        { isDeleted: true },
        { new: true },
      );
      return 'User deleted succesfully';
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
