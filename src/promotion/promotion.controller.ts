
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Promotion } from 'src/common/schema/promotion.schema';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  async create(@Body() createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    return await this.promotionService.create(createPromotionDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    return await this.promotionService.update(id, updatePromotionDto);
  }
  @Get()
  async findAll(): Promise<Promotion[]> {
    return await this.promotionService.findAll();
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string): Promise<Promotion[]> {
    return await this.promotionService.findByUserId(userId);
  }

  @Get('promotion/:id')
  async findById(@Param('id') id: string): Promise<Promotion> {
    return await this.promotionService.findById(id);
  }
}