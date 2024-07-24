import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AssetStatus, AssetType } from '../../common/enum/asset.enum';
import { Types } from 'mongoose';

export class UpdateAssetDto {
  @IsEnum(AssetType)
  @IsOptional()
  type: AssetType;

  @IsString()
  @IsOptional()
  serialNumber: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status: AssetStatus;

  @IsOptional()
  receivedDate?: Date;

  @IsOptional()
  returnDate?: Date;

  @IsString()
  @IsOptional()
  userId?: Types.ObjectId;
}
