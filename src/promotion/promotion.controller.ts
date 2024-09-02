// src/promotion/promotion.controller.ts
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Promotion } from 'src/common/schema/promotion.schema';
import { Types } from 'mongoose';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  async create(@Body() createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    return this.promotionService.create(createPromotionDto);
  }



  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const objectId = new Types.ObjectId(id);  // Convert id to ObjectId
    return this.promotionService.update(objectId.toHexString(), updatePromotionDto);
  }

  @Get()
  async findAll(): Promise<Promotion[]> {
    return this.promotionService.findAll();
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string): Promise<Promotion[]> {
    return this.promotionService.findByUserId(new Types.ObjectId(userId));
  }

  @Get('promotion/:id')
  async findById(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.findById(new Types.ObjectId(id));

    
  }
}