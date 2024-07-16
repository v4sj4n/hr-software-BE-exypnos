import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetStatus } from '../schemas/asset.schema';
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
      this.checkCreateUserId(createAssetDto);
      this.checkCreateAssetStatus(createAssetDto);
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
    const asset = await this.assetModel.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    this.checkUpdateUserId(updateAssetDto);
    this.checkUpdateAssetStatus(updateAssetDto);
    const updatedAsset = await this.assetModel.findByIdAndUpdate(
      id,
      updateAssetDto,
      { new: true },
    );
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

  // Check if the user exists in the database

  checkCreateUserId(createAssetDto: CreateAssetDto) {
    if (createAssetDto.userId && createAssetDto.userId !== null) {
      const userExists = this.userModel.findById(createAssetDto.userId);
      if (!userExists) {
        throw new NotFoundException(
          `User with id ${createAssetDto.userId} not found`,
        );
      }
    } else {
      createAssetDto.userId = null;
    }
  }

  checkCreateAssetStatus(createAssetDto: CreateAssetDto) {
    if (
      !createAssetDto.userId &&
      createAssetDto.status === AssetStatus.ASSIGNED
    ) {
      throw new ConflictException(
        `Asset with status ${createAssetDto.status} must have a user`,
      );
    }
    if (
      createAssetDto.userId &&
      (createAssetDto.status === AssetStatus.AVAILABLE ||
        createAssetDto.status === AssetStatus.BROKEN)
    ) {
      throw new ConflictException(
        `Asset with status ${createAssetDto.status} cannot have a user`,
      );
    }
  }

  checkUpdateUserId(updateAssetDto: UpdateAssetDto) {
    if (
      updateAssetDto.userId &&
      updateAssetDto.userId !== null &&
      updateAssetDto.userId.length === 24
    ) {
      const userExists = this.userModel.findById(updateAssetDto.userId);
      if (!userExists) {
        throw new NotFoundException(
          `User with id ${updateAssetDto.userId} not found`,
        );
      }
    } else {
      updateAssetDto.userId = null;
    }
  }

  checkUpdateAssetStatus(updateAssetDto: UpdateAssetDto) {
    if (
      !updateAssetDto.userId &&
      updateAssetDto.status === AssetStatus.ASSIGNED
    ) {
      throw new ConflictException(
        `Asset with status ${updateAssetDto.status} must have a user`,
      );
    }
    if (
      updateAssetDto.userId &&
      (updateAssetDto.status === AssetStatus.AVAILABLE ||
        updateAssetDto.status === AssetStatus.BROKEN)
    ) {
      throw new ConflictException(
        `Asset with status ${updateAssetDto.status} cannot have a user`,
      );
    }
  }
}
