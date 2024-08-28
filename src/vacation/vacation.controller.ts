import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { VacationService } from './vacation.service';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';

@Controller('vacation')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Post()
  create(@Body() createVacationDto: CreateVacationDto) {
    return this.vacationService.create(createVacationDto);
  }

  @Get()
  findAll(
    @Query('type') type: string = '',
    @Query('status') status: string = '',
    @Query('startDate') startDate: string = '',
    @Query('endDate') endDate: string = '',
  ) {
    return this.vacationService.findAll(type, status, startDate, endDate);
  }

  @Get('user')
  findAllWithUsers(
    @Query('search') search: string = '',
    @Query('users') users: string = 'all',
  ) {
    return this.vacationService.getAllUserVacation(search, users);
  }

  @Get('user/:id')
  findAllWithUsersById(@Param('id') id: string) {
    return this.vacationService.getUserVacation(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVacationDto: UpdateVacationDto,
  ) {
    return this.vacationService.update(id, updateVacationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacationService.remove(id);
  }
}
