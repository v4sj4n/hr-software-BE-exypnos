import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Asset, AssetHistory } from '../common/schema/asset.schema';
import { AssetStatus } from '../common/enum/asset.enum';
import { User } from '../common/schema/user.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { compareDates, formatDate } from 'src/common/util/dateUtil';

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
      createdAsset.takenDate = createAssetDto.takenDate
        ? new Date(createAssetDto.takenDate)
        : null;
      createdAsset.returnDate = createAssetDto.returnDate
        ? new Date(createAssetDto.returnDate)
        : null;
      createdAsset.userId = createAssetDto.userId
        ? new mongoose.Types.ObjectId(createAssetDto.userId)
        : null;

      const initialHistory: AssetHistory = {
        updatedAt: new Date(),
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

      await this.validateHistoryData(updateAssetDto, existingAsset);
      await this.assetModel.findByIdAndUpdate(
        id,
        {
          ...updateAssetDto,
          takenDate: updateAssetDto.takenDate
            ? new Date(updateAssetDto.takenDate)
            : null,
          return: updateAssetDto.returnDate
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
  async validateHistoryData(
    updateAssetDto: UpdateAssetDto,
    existingAsset: mongoose.Document<unknown, {}, Asset> &
      Asset & { _id: mongoose.Types.ObjectId },
  ) {
    if (updateAssetDto.status === AssetStatus.ASSIGNED) {
      const updateUser =await this.userModel.findById(updateAssetDto.userId);
      const newHistoryEntry: AssetHistory = {
        updatedAt: new Date(),
        takenDate: updateAssetDto.takenDate,
        returnDate: null,
        user: {_id: updateUser._id, firstName: updateUser.firstName, lastName: updateUser.lastName},
        status: updateAssetDto.status,
      };
      Object.assign(updateAssetDto, {
        history: [...existingAsset.history, newHistoryEntry],
      });
    } else if (
      (updateAssetDto.status === AssetStatus.AVAILABLE ||
        updateAssetDto.status === AssetStatus.BROKEN) &&
      existingAsset.status
    ) {
      // make sure to add the returnDate date in the last history entry
      const lastHistoryEntry = existingAsset.history.pop();
      const user = await this.userModel.findById(lastHistoryEntry.user._id);
      const newHistoryEntry: AssetHistory = {
        updatedAt: new Date(),
        takenDate: lastHistoryEntry.takenDate,
        returnDate: updateAssetDto.returnDate,
        user: lastHistoryEntry.user,
        status: updateAssetDto.status,
      };
      Object.assign(updateAssetDto, {
        history: [...existingAsset.history, newHistoryEntry],
      });
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
    if (!assetData.status && assetData.userId) {
      assetData.status = AssetStatus.ASSIGNED;
    }
    if (assetData.userId && assetData.status !== AssetStatus.ASSIGNED) {
      throw new ConflictException(
        `Asset with user must have status ${AssetStatus.ASSIGNED}`,
      );
    }
    if (assetData.userId && !assetData.takenDate) {
      throw new ConflictException(`Asset with user must have a takenDate date`);
    }
    if (assetData.returnDate && !existingAsset.takenDate) {
      throw new ConflictException(`Asset must have a takenDate date first`);
    }
    if (
      assetData.returnDate &&
      compareDates(
        formatDate(new Date(existingAsset.takenDate)),
        formatDate(new Date(assetData.returnDate)),
      ) >= 1
    ) {
      throw new ConflictException(
        `Return date cannot be before the taken date`,
      );
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
      throw new ConflictException('Serial number must be unique');
    }
  }

  async getAllUserWithAssets(search: string, users: string): Promise<User[]> {
    let objectToPassToMatch: FilterQuery<any> =
      users === 'with'
        ? {
            assets: { $ne: [] },
          }
        : users === 'without'
          ? {
              assets: { $eq: [] },
            }
          : {};

    if (search) {
      objectToPassToMatch = {
        ...objectToPassToMatch,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    try {
      const usersWithAsset = await this.userModel.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: '_id',
            foreignField: 'userId',
            as: 'assets',
          },
        },
        {
          $match: {
            ...objectToPassToMatch,
          },
        },
        {
          $sort: {
            firstName: 1,
            lastName: 1,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            imageUrl: 1,
            phone: 1,
            assets: 1,
            role: 1,
          },
        },
      ]);

      return usersWithAsset;
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getUserWithAssets(id: string): Promise<User> {
    const user = await this.userModel.findById(id).populate('auth');
    if (!user || user.isDeleted) {
      throw new ConflictException(`User with id ${id} not found`);
    }

    try {
      const userWithAsset = await this.userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'assets',
            localField: '_id',
            foreignField: 'userId',
            as: 'assets',
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'auth',
            foreignField: '_id',
            as: 'authData',
          },
        },
        {
          $unwind: {
            path: '$authData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            role: 1,
            imageUrl: 1,
            email: '$authData.email',
            phone: 1,
            assets: 1,
          },
        },
      ]);

      if (userWithAsset.length === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return userWithAsset[0];
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getAssetBySerialNumber(serialNumber: string): Promise<Asset> {
    const asset = await this.assetModel
      .findOne({ serialNumber })
      .populate('userId', 'firstName lastName imageUrl');
    if (!asset) {
      throw new NotFoundException(
        `Asset with serial number ${serialNumber} not found`,
      );
    }
    return asset;
  }

  async getAvaibleAssets(): Promise<Asset[]> {
    return await this.assetModel.find({
      status: AssetStatus.AVAILABLE,
      isDeleted: false,
    });
  }
}
