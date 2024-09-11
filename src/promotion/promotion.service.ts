import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Promotion } from 'src/common/schema/promotion.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { User } from '../common/schema/user.schema';

@Injectable()
export class PromotionService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const user = await this.userModel.findById(createPromotionDto.userId);
    if (!user) {
      throw new NotFoundException(
        `User with id ${createPromotionDto.userId} not found`,
      );
    }
    if (
      user.position === createPromotionDto.position 
      && user.grade === createPromotionDto.grade
    ) {
      throw new ConflictException('User already has this position and grade');
    } else{
    await this.userModel.findByIdAndUpdate(createPromotionDto.userId, {
      position: createPromotionDto.position,
      grade: createPromotionDto.grade,
    });
    }

    const createdPromotion = new this.promotionModel({
      ...createPromotionDto,
      userId: new Types.ObjectId(createPromotionDto.userId),
    });

    return createdPromotion.save();
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    const user = await this.userModel.findById(promotion.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if(updatePromotionDto.position === user.position && updatePromotionDto.grade === user.grade){
      throw new ConflictException('User already has this position and grade');
    }
    if (
      updatePromotionDto.position &&
      updatePromotionDto.position !== user.position
    ) {
      await this.userModel.findByIdAndUpdate(promotion.userId, {
        position: updatePromotionDto.position,
      });
    }
    if (updatePromotionDto.grade && updatePromotionDto.grade !== user.grade) {
      await this.userModel.findByIdAndUpdate(promotion.userId, {
        grade: updatePromotionDto.grade,
      });
      }

    return this.promotionModel.findByIdAndUpdate(id, updatePromotionDto, {
      new: true,
    });
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionModel.find({ isDeleted: false });
  }

  async findByUserId(userId: string): Promise<Promotion[]> {
    return this.promotionModel.find({ userId: new Types.ObjectId(userId) });
  }

  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }
  async delete(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    await this.promotionModel.findByIdAndUpdate(id, { isDeleted: true });
    return promotion;
  }
}
