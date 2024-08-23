
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Promotion } from 'src/common/schema/promotion.schema';

@Controller('dev-promotion')
export class PromotionController {
  constructor(private readonly devPromotionService: PromotionService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    return this.devPromotionService.create(createPromotionDto);
  }

  @Get()
  findAll(): Promise<Promotion[]> {
    return this.devPromotionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Promotion> {
    return this.devPromotionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: Partial<CreatePromotionDto>): Promise<Promotion> {
    return this.devPromotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Promotion> {
    return this.devPromotionService.remove(id);
  }
}