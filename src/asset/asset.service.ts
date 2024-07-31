import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Asset, AssetHistory } from '../common/schema/asset.schema';
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
    try {
      await this.validateAssetData(createAssetDto);
      await this.checkSerialNumber(createAssetDto.serialNumber);
      const createdAsset = new this.assetModel(createAssetDto);
      createdAsset.receivedDate = createAssetDto.receivedDate
        ? new Date(createAssetDto.receivedDate)
        : null;
      createdAsset.returnDate = createAssetDto.returnDate
        ? new Date(createAssetDto.returnDate)
        : null;
      createdAsset.userId = createAssetDto.userId
        ? new mongoose.Types.ObjectId(createAssetDto.userId)
        : null;

      const initialHistory: AssetHistory = {
        updatedAt: new Date(),
        receivedDate: createdAsset.receivedDate,
        returnDate: createdAsset.returnDate,
        userId: createdAsset.userId,
        status: createdAsset.status,
      };
      createdAsset.history = [initialHistory];
      return await createdAsset.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findAll(): Promise<Asset[]> {
    try {
      return await this.assetModel
        .find({ isDeleted: false })
        .populate('userId', 'firstName lastName');
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async findOne(id: string): Promise<Asset> {
    try {
      const asset = await this.assetModel
        .findById(id)
        .populate('userId', 'firstName lastName');
      if (!asset || asset.isDeleted) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }
      return asset;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    try {
      const existingAsset = await this.assetModel.findById(id);
      if (!existingAsset) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }
      await this.validateAssetData(updateAssetDto, existingAsset);
      if (updateAssetDto.serialNumber) {
        await this.checkSerialNumber(updateAssetDto.serialNumber, id);
      }
      const newHistoryEntry: AssetHistory = {
        updatedAt: new Date(),
        receivedDate: updateAssetDto.receivedDate,
        returnDate: updateAssetDto.returnDate,
        userId: updateAssetDto.userId,
        status: updateAssetDto.status,
      };
      Object.assign(updateAssetDto, {
        history: [...existingAsset.history, newHistoryEntry],
      });

      await this.assetModel.findByIdAndUpdate(
        id,
        {
          ...updateAssetDto,
          receivedDate: updateAssetDto.receivedDate
            ? new Date(updateAssetDto.receivedDate)
            : null,
          returnDate: updateAssetDto.returnDate
            ? new Date(updateAssetDto.returnDate)
            : null,
          userId: updateAssetDto.userId
            ? new mongoose.Types.ObjectId(updateAssetDto.userId)
            : null,
        },
        { new: true },
      );

      return await this.assetModel.findById(id);
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async remove(id: string): Promise<Asset> {
    try {
      const asset = await this.assetModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      if (!asset) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }
      return asset;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async getAssetHistory(id: string): Promise<AssetHistory[]> {
    const asset = await this.assetModel.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset.history;
  }

  private async validateAssetData(
    assetData: CreateAssetDto | UpdateAssetDto,
    existingAsset?: Asset,
  ) {
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

    if(!assetData.status && assetData.userId) {
      throw new ConflictException(
        `Asset with user ${assetData.userId} must have a status assigned`,
      );
    }

    if (
      assetData.userId &&
      (assetData.status === AssetStatus.AVAILABLE ||
        assetData.status === AssetStatus.BROKEN)
    ) {
      throw new ConflictException(
        `Asset with status ${assetData.status} cannot have a user`,
      );
    }

    if (existingAsset) {
      if (
        (assetData.status === AssetStatus.AVAILABLE ||
          assetData.status === AssetStatus.BROKEN) &&
        assetData.receivedDate !== undefined
      ) {
        throw new ConflictException(
          `Cannot change status from ${existingAsset.status} to ${assetData.status} with received date`,
        );
      }
      if (
        (assetData.status === AssetStatus.AVAILABLE ||
          assetData.status === AssetStatus.BROKEN) &&
        assetData.returnDate &&
        existingAsset?.status !== AssetStatus.ASSIGNED
      ) {
        throw new ConflictException(
          `Cannot change status from ${existingAsset.status} to ${assetData.status}`,
        );
      }
    }
  }
  private async checkSerialNumber(
    serialNumber: string,
    excludeId?: string,
  ): Promise<void> {
    const query = { serialNumber };
    if (excludeId) {
      Object.assign(query, { _id: { $ne: excludeId } });
    }
    const existingAsset = await this.assetModel.findOne(query);
    if (existingAsset) {
      throw new ConflictException('Serial number must be different');
    }
  }
}
