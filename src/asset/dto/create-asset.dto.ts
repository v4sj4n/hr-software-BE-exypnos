import { IsString, IsEnum, IsOptional, MinLength, MaxLength, IsAlphanumeric } from 'class-validator';
import { AssetType, AssetStatus } from '../../common/enum/asset.enum';
import { Types } from 'mongoose';

export class CreateAssetDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
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
