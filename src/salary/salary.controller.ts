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
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }
  @Get()
  find(@Query('month') month: number, @Query('year') year: number) {
    const resolvedMonth = !Number.isNaN(month)
      ? month
      : new Date().getMonth() - 1;
    if (resolvedMonth < 0 || resolvedMonth > 11) {
      throw new Error('Month must be between 0 and 11');
    }
    return this.salaryService.findAll(
      resolvedMonth,
      year ? year : new Date().getFullYear(),
    );
  }
  @Get('user/:id')
  findByUserId(
    @Param('id') id: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('graf') graf: boolean,
  ) {
    return this.salaryService.findByUserId(id, month, year, graf);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salaryService.update(id, updateSalaryDto);
  }
}
