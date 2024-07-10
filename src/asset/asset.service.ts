import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from '../schemas/asset.schema';
import { User } from '../schemas/user.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    try {
      if (
        createAssetDto.userId &&
        createAssetDto.userId !== '0' &&
        createAssetDto.userId.length === 24
      ) {
        const userExists = await this.userModel.findById(createAssetDto.userId);
        if (!userExists) {
          throw new NotFoundException(
            `User with id ${createAssetDto.userId} not found`,
          );
        }
      } else {
        createAssetDto.userId = '000000000000000000000000';
      }

      const createdAsset = new this.assetModel(createAssetDto);
      return await createdAsset.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(error.message);
    }
  }

  async findAll(): Promise<Asset[]> {
    return await this.assetModel.find().exec();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetModel.findById(id).exec();
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    if (updateAssetDto.userId) {
      if (updateAssetDto.userId === '0') {
        updateAssetDto.userId = '000000000000000000000000';
      } else {
        if (updateAssetDto.userId.length !== 24) {
          throw new NotFoundException(
            `Invalid userId ${updateAssetDto.userId}`,
          );
        }
        const userExists = await this.userModel.findById(updateAssetDto.userId);
        if (!userExists) {
          throw new NotFoundException(
            `User with id ${updateAssetDto.userId} not found`,
          );
        }
      }
    }

    const updatedAsset = await this.assetModel
      .findByIdAndUpdate(id, updateAssetDto, { new: true })
      .exec();
    if (!updatedAsset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return updatedAsset;
  }

  async remove(id: string): Promise<Asset> {
    const deletedAsset = await this.assetModel.findOne({ _id: id }).exec();
    if (!deletedAsset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    await this.assetModel.deleteOne({ _id: id }).exec();
    return deletedAsset;
  }
}
