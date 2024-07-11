import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/schemas/user.schema';
import { SignInUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.signUp(createUserDto);
  }

  @Post('/signin')
  async signIn(
    @Body() signInUserDto: SignInUserDto,
  ): Promise<{ message: string; data: { access_token: string } }> {
    return await this.authService.signIn(signInUserDto);
  }
}
