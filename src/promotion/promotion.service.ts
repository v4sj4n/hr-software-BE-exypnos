// src/dev-promotion/dev-promotion.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Promotion } from 'src/common/schema/promotion.schema';
import { User } from 'src/common/schema/user.schema';
import { Project } from 'src/common/schema/project.schema';

@Injectable()
export class PromotionService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const createdPromotion = new this.promotionModel(createPromotionDto);
    return createdPromotion.save();
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionModel.find().exec();
  }

  async findOne(id: string): Promise<Promotion> {
    return this.promotionModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePromotionDto: Partial<CreatePromotionDto>,
  ): Promise<Promotion> {
    return this.promotionModel
      .findByIdAndUpdate(id, updatePromotionDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Promotion> {
    return this.promotionModel.findByIdAndDelete(id).exec();
  }

  async getAllPromotion(id: string): Promise<Promotion[]> {
    return this.promotionModel
      .find({
        user: id,
        position: { $ne: null },
        grade: { $ne: null },
        startDate: { $ne: null },
      })
      .populate('userId', 'firstName lastName');
  }
  async getAllPromotionByProject(): Promise<Promotion[]> {
    return this.promotionModel.find({projectId:{$ne:null}}).populate('userId', 'firstName lastName');
}
}