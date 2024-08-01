import {
  Controller,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseInterceptors,
  Post,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../common/schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }
  @Get('search/:name')
  async searchUser(@Param('name') name: string): Promise<User[]> {
    return this.userService.filterUsers(name);
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return await this.userService.updateUser(updateUserDto, id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.uploadImage(file, req);
  }
}
