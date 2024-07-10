import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    console.log(id);
    return await this.userService.findOne(id);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
