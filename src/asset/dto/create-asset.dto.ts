import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { AssetType, AssetStatus } from '../../common/enum/asset.enum';
import { Types } from 'mongoose';

export class CreateAssetDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
  serialNumber: string;

  @IsEnum(AssetStatus)
  status: AssetStatus;

  @IsDate()
  @IsOptional()
  receivedDate?: Date;

  @IsDate()
  @IsOptional()
  returnDate?: Date;

  @IsString()
  @IsOptional()
  userId?: Types.ObjectId;
}
