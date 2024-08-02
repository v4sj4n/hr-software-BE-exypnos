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
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.vacationService.findAllPaginate(page, limit);
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
