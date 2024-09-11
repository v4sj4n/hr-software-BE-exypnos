import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/common/schema/user.schema';
import { SignInUserDto } from './dto/signin-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { UpdatePasswordDto } from './dto/updatePasswordDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.signUp(createUserDto);
  }

  @Public()
  @Post('/signin')
  async signIn(
    @Body() signInUserDto: SignInUserDto,
  ): Promise<{ message: string; data: { access_token: string } }> {
    return await this.authService.signIn(signInUserDto);
  }

  @Get('getuser')
  async getProfile(@Request() req) {
    return await this.authService.getUser(req.user.email);
  }

  @Post('updatepassword')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req,
  ) {
    return await this.authService.updatePassword(
      updatePasswordDto,
      req.user.email,
    );
  }

  // New route to request a password reset by generating a reset token and sending a reset email
  @Public()
  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return await this.authService.sendPasswordResetToken(email);  // Updated logic
  }

  // Route to confirm password change using the token
  @Public()
  @Post('confirm-password-change')
  async confirmPasswordChange(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    return await this.authService.confirmPasswordChange(token, newPassword, confirmPassword);
  }
}
