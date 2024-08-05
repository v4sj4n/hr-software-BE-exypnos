import { IsString, IsEnum, IsOptional, MinLength, MaxLength, IsAlphanumeric } from 'class-validator';
import { AssetStatus, AssetType } from '../../common/enum/asset.enum';
import { Types } from 'mongoose';

export class UpdateAssetDto {
  @IsEnum(AssetType)
  @IsOptional()
  type: AssetType;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(12)
  @IsAlphanumeric()
  serialNumber: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status: AssetStatus;

  @IsOptional()
  receive?: Date;

  @IsOptional()
  return?: Date;

  @IsString()
  @IsOptional()
  userId?: Types.ObjectId;
}
