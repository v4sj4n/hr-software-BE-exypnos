import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AssetType } from '../../schemas/asset.schema';

export class CreateAssetDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
  serialNumber: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
