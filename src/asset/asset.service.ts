import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Asset } from '../common/schema/asset.schema';
import { AssetStatus } from '../common/enum/asset.enum';
import { User } from '../common/schema/user.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    await this.validateAssetData(createAssetDto);
    const createdAsset = new this.assetModel(createAssetDto);
    createdAsset.userId = createAssetDto.userId
      ? new mongoose.Types.ObjectId(createAssetDto.userId)
      : null;
    return await createdAsset.save();
  }

  async findAll(): Promise<Asset[]> {
    return await this.assetModel.find().exec();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetModel.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    await this.validateAssetData(updateAssetDto);
    const updatedAsset = await this.assetModel.findByIdAndUpdate(
      id,
      {
        ...updateAssetDto,
        userId: updateAssetDto.userId
          ? new mongoose.Types.ObjectId(updateAssetDto.userId)
          : null,
      },
      { new: true },
    );
    if (!updatedAsset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return updatedAsset;
  }

  async remove(id: string): Promise<Asset> {
    const deletedAsset = await this.assetModel.findByIdAndDelete(id).exec();
    if (!deletedAsset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return deletedAsset;
  }

  private async validateAssetData(assetData: CreateAssetDto | UpdateAssetDto) {
    if (assetData.userId) {
      const userExists = await this.userModel.findById(assetData.userId);
      if (!userExists) {
        throw new NotFoundException(
          `User with id ${assetData.userId} not found`,
        );
      }
    }

    if (!assetData.userId && assetData.status === AssetStatus.ASSIGNED) {
      throw new ConflictException(
        `Asset with status ${assetData.status} must have a user`,
      );
    }

    if (assetData.userId && assetData.status === AssetStatus.AVAILABLE) {
      throw new ConflictException(
        `Asset with status ${assetData.status} cannot have a user`,
      );
    }
    if (assetData.status === AssetStatus.BROKEN) {
      throw new ConflictException(
        `Asset with status ${assetData.status} cannot create`,
      );
    }
  }
}
