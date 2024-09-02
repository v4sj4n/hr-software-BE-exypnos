import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Promotion, PromotionDocument } from 'src/common/schema/promotion.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  update(arg0: string, updatePromotionDto: UpdatePromotionDto): Promotion | PromiseLike<Promotion> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const createdPromotion = new this.promotionModel({
      ...createPromotionDto,
      userId: new Types.ObjectId(createPromotionDto.userId),  // Convert userId to ObjectId
    });
    return createdPromotion.save();
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionModel.find().exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<Promotion[]> {
    return this.promotionModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findById(id: Types.ObjectId): Promise<Promotion> {
    return this.promotionModel.findById(id).exec();
  }
}