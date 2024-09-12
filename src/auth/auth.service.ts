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
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(Auth.name) private authModel: mongoose.Model<Auth>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // Sign Up logic
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

      const user = await this.userModel.create({
        ...userProperties,
        auth: userAuth._id,
      });

      // Send welcome email
      await this.mailService.sendMail({
        to: createUserDto.email,
        subject: 'Welcome to Codevider',
        template: 'welcome',
        context: {
          name: `${createUserDto.firstName} ${createUserDto.lastName}`,
          email: createUserDto.email,
          password,
        },
      });
      return user;
    } catch (err) {
      throw new ConflictException('Error creating user');
    }
  }

  // Sign In logic
  async signIn(signInUserDto: SignInUserDto): Promise<{
    message: string;
    data: { access_token: string; user: any };
  }> {
    try {
      const userAuth = await this.authModel.findOne({
        email: signInUserDto.email,
      });
      if (!userAuth) {
        throw new NotFoundException('Invalid credentials');
      }

      // Populate the auth field from the User schema to get the email
      const user = await this.userModel
        .findOne({ auth: userAuth._id })
        .populate('auth');

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
          user: {
            ...user.toObject(),
            email: userAuth.email, // Access email property from userAuth object
          },
        },
      };
    } catch (err) {
      throw new ConflictException('Error signing in');
    }
  }

  // Forgot password logic
  async forgotPassword(email: string): Promise<string> {
    try {
      const userAuth = await this.authModel.findOne({ email });
      if (!userAuth) {
        throw new NotFoundException('User not found');
      }

      // Generate a unique reset token and store it in the auth model
      const resetToken = randomBytes(32).toString('hex');
      userAuth.resetPasswordToken = resetToken;
      userAuth.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
      await userAuth.save();

      // Create the reset URL
      const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

      // Send the reset password email
      await this.mailService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: 'resetPassword',
        context: {
          name: email,
          resetUrl,
        },
      });

      return 'Password reset link has been sent to your email';
    } catch (err) {
      console.error('Error during password reset request:', err);
      throw new ConflictException('Error during password reset request');
    }
  }

  // Reset password logic
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    try {
      const { token, newPassword } = resetPasswordDto;

      // Find the user by reset token and check expiration
      const userAuth = await this.authModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
      });

      if (!userAuth) {
        throw new NotFoundException('Invalid or expired token');
      }

      // Hash the new password and update the auth model
      const salt = await bcrypt.genSalt(10);
      userAuth.password = await bcrypt.hash(newPassword, salt);
      userAuth.resetPasswordToken = null; // Clear the reset token
      userAuth.resetPasswordExpires = null; // Clear the expiration
      await userAuth.save();

      return 'Password reset successfully';
    } catch (err) {
      throw new ConflictException('Error resetting password');
    }
  }

  // Get User logic
  async getUser(email: string): Promise<User> {
    try {
      const userAuth = await this.authModel.findOne({ email });
      const user = await this.userModel
        .findOne({ auth: userAuth._id })
        .populate('auth');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (err) {
      throw new ConflictException('Error retrieving user');
    }
  }

  // Update password logic
  async updatePassword(updatePasswordDto: UpdatePasswordDto, email: string): Promise<string> {
    try {
      // Check if the user exists in the authModel
      const userAuth = await this.authModel.findOne({ email });
      
      if (!userAuth) {
        throw new NotFoundException('User not found');
      }
  
      // Compare old password
      const isMatch = await bcrypt.compare(updatePasswordDto.oldPassword, userAuth.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid old password');
      }
  
      // Hash and update the new password
      const salt = await bcrypt.genSalt(10);
      userAuth.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);
      await userAuth.save();
  
      return 'Password updated successfully';
    } catch (err) {
      console.error('Error updating password:', err);
      throw new ConflictException('Error updating password');
    }
  }
  
  

  // Soft delete user logic
  async removeUser(email: string): Promise<string> {
    try {
      await this.authModel.findOneAndUpdate(
        { email },
        { isDeleted: true },
        { new: true },
      );
      return 'User deleted successfully';
    } catch (err) {
      throw new ConflictException('Error deleting user');
    }
  }
}
