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
import { randomBytes } from 'crypto';

type IUser = User & { email: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(Auth.name) private authModel: mongoose.Model<Auth>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // Make this method public so it can be reused by other services
  public generateConfirmationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, firstName, lastName, phone, imageUrl, gender, dob, pob } =
        createUserDto;

      // Generate random password and hash it
      const password = generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Check if user already exists by email
      const existingAuth = await this.authModel.findOne({ email });
      if (existingAuth) {
        throw new ConflictException('Email already exists');
      }

      // Create user authentication entry
      const userAuth = await this.authModel.create({
        email,
        password: hashedPassword,
      });

      // Create user record with new fields included
      const user = await this.userModel.create({
        firstName,
        lastName,
        phone,
        imageUrl,
        gender,
        dob,
        pob,
        auth: userAuth._id,
      });

      // Send welcome email
      await this.mailService.sendMail({
        to: email,
        subject: 'Welcome to Codevider',
        template: 'welcome',
        context: {
          name: firstName + ' ' + lastName,
          email,
          password,
        },
      });

      return user;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async sendPasswordResetToken(email: string): Promise<string> {
    try {
      const userAuth = await this.authModel.findOne({ email });
  
      // Always return a success message, even if the user is not found
      if (!userAuth) {
        return 'If this email is registered, you will receive a password reset link.';
      }
  
      const token = this.generateConfirmationToken();
      userAuth.passwordResetToken = token;
      userAuth.passwordResetExpires = new Date(Date.now() + 3600000); // 1-hour expiry
      await userAuth.save();
  
      await this.mailService.sendMail({
        to: email,
        subject: 'Password Reset Confirmation',
        template: 'password-reset',
        context: { token, email },
      });
  
      return 'If this email is registered, you will receive a password reset link.';
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
        message: 'Authenticated Successfully',
        data: {
          access_token: await this.jwtService.signAsync(payload),
          user: { ...user.toObject(), email: signInUserDto.email },
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
      const userAuth = await this.authModel.findOne({ email });
  
      if (!userAuth) {
        throw new NotFoundException('User not found');
      }
  
      const isMatch = await bcrypt.compare(updatePasswordDto.oldPassword, userAuth.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        userAuth.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);
        await userAuth.save();
        return 'Password updated successfully';
      } else {
        // Optionally provide a different response here to clarify the reset process
        const token = this.generateConfirmationToken();
        userAuth.passwordResetToken = token;
        userAuth.passwordResetExpires = new Date(Date.now() + 3600000); // 1-hour expiry
        await userAuth.save();
  
        await this.mailService.sendMail({
          to: email,
          subject: 'Password Reset Confirmation',
          template: 'password-reset',
          context: { token, email },
        });
  
        return 'Old password incorrect. A password reset link has been sent to your email.';
      }
    } catch (err) {
      throw new ConflictException(err);
    }
  }
  

  async confirmPasswordChange(token: string, newPassword: string, confirmPassword: string) {
    try {
      const userAuth = await this.authModel.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!userAuth) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (newPassword !== confirmPassword) {
        throw new ConflictException('Passwords do not match');
      }

      const salt = await bcrypt.genSalt(10);
      userAuth.password = await bcrypt.hash(newPassword, salt);
      userAuth.passwordResetToken = undefined;
      userAuth.passwordResetExpires = undefined;
      await userAuth.save();

      return { message: 'Password has been updated successfully' };
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
      return 'User deleted successfully';
    } catch (err) {
      throw new ConflictException(err);
    }
  }
}
