import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { AssetStatus, AssetType } from '../../common/enum/asset.enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

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
  @IsDate()
  @Type(() => Date)
  receivedDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  returnDate?: Date;

  @IsString()
  @IsOptional()
  userId?: Types.ObjectId;
}
