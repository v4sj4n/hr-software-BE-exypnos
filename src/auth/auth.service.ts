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
import { Role } from 'src/common/enum/role.enum';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { MailerService } from '@nestjs-modules/mailer';
import { generateRandomPassword } from 'src/common/util/generateRandomPassword';

type IUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const password = generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });
      await this.mailService.sendMail({
        from: process.env.MAIL_USERNAME,
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
  async signIn(
    signInUserDto: SignInUserDto,
  ): Promise<{ message: string; data: { access_token: string; user: IUser } }> {
    try {
      const user = await this.userModel.findOne({ email: signInUserDto.email });
      const userObject = {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        phone: user.phone,
      };

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
        role: user.role,
      };

      return {
        message: 'Authenticated Succesfully',
        data: {
          access_token: await this.jwtService.signAsync(payload),
          user: userObject,
        },
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getUser(email: string): Promise<IUser> {
    try {
      const user = await this.userModel.findOne({ email });
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, email: string) {
    try {
      const user = await this.userModel.findOne({ email });

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
}
