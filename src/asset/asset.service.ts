import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, PipelineStage } from 'mongoose';
import { Asset, AssetHistory } from '../common/schema/asset.schema';
import { AssetStatus } from '../common/enum/asset.enum';
import { User } from '../common/schema/user.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { DateTime } from 'luxon';
import { paginate } from 'src/common/util/pagination';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    try {
      await this.validateAssetData(createAssetDto);
      await this.checkType(createAssetDto.type);
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

      createdAsset.history = [];
      return await createdAsset.save();
    } catch (error) {
      throw new ConflictException(error);
    }
  }
  checkType(type: string) {
    if (!AssetType.includes(type)) {
      AssetType.push(type);
    }
  }

  async findAll(availability: string): Promise<Asset[]> {
    const filter: FilterQuery<Asset> = {
      isDeleted: false,
    };
    if (Object.values(AssetStatus).includes(availability as AssetStatus)) {
      filter.status = availability;
    }
    try {
      return await this.assetModel
        .find(filter)
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
    existingAsset: mongoose.Document<unknown, object, Asset> &
      Asset & { _id: mongoose.Types.ObjectId },
  ) {
    const now = DateTime.now();

    // Ensure the history array is initialized if it doesn't exist
    if (!existingAsset.history) {
      existingAsset.history = [];
    }

    let takenDate;

    if (updateAssetDto.takenDate) {
      // Convert takenDate from ISO string to JS Date
      takenDate = DateTime.fromISO(
        updateAssetDto.takenDate.toString(),
      ).toJSDate();
    } else if (existingAsset.takenDate) {
      // If takenDate is not provided, use existingAsset's takenDate
      takenDate = DateTime.fromJSDate(existingAsset.takenDate).toJSDate();
    } else {
      // If takenDate is not available, we can't proceed
      throw new ConflictException(
        'Taken date is required for assigned assets.',
      );
    }

    if (updateAssetDto.status === AssetStatus.ASSIGNED) {
      const updateUser = await this.userModel.findById(updateAssetDto.userId);
      if (!updateUser) {
        throw new NotFoundException(
          `User with id ${updateAssetDto.userId} not found`,
        );
      }

      const newHistoryEntry: AssetHistory = {
        updatedAt: now.toJSDate(),
        takenDate: takenDate,
        returnDate: null,
        user: {
          _id: updateUser._id,
          firstName: updateUser.firstName,
          lastName: updateUser.lastName,
        },
        status: updateAssetDto.status,
      };

      existingAsset.history.push(newHistoryEntry);
      Object.assign(updateAssetDto, {
        history: existingAsset.history,
      });
    } else if (
      (updateAssetDto.status === AssetStatus.AVAILABLE ||
        updateAssetDto.status === AssetStatus.BROKEN) &&
      existingAsset.history.length > 0
    ) {
      const lastHistoryEntry = existingAsset.history.pop();

      const newHistoryEntry: AssetHistory = {
        updatedAt: now.toJSDate(),
        takenDate: lastHistoryEntry.takenDate,
        returnDate: updateAssetDto.returnDate
          ? DateTime.fromISO(updateAssetDto.returnDate.toString()).toJSDate()
          : null,
        user: lastHistoryEntry.user,
        status: updateAssetDto.status,
      };

      existingAsset.history.push(newHistoryEntry);
      Object.assign(updateAssetDto, {
        history: existingAsset.history,
      });
    } else {
      throw new ConflictException(
        'Cannot update history; asset has no previous history entries.',
      );
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
      existingAsset.takenDate &&
      DateTime.fromJSDate(existingAsset.takenDate).toMillis() >
        DateTime.fromJSDate(assetData.returnDate).toMillis()
    ) {
      throw new ConflictException(
        'Return date cannot be before the taken date',
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

  async getAllUserWithAssets(search: string, users: string, page: number, limit: number): Promise<any> {
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
      const aggregationPipeline:PipelineStage[] = [
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
            email: '$authData.email',
          },
        },
      ];
  
      const paginatedResults = await paginate(
        page,
        limit,
        this.userModel,
        objectToPassToMatch,
        aggregationPipeline
      );
  
      return paginatedResults;
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
