import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInUserDto } from './dto/signin-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Post('/sign-up')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('/sign-in')
  async signIn(
    @Body() signInUserDto: SignInUserDto,
  ): Promise<{ message: string; data: { access_token: string } }> {
    return await this.userService.findUser(signInUserDto);
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @Put(':id')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return await this.userService.updateUser(updateUserDto, id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
