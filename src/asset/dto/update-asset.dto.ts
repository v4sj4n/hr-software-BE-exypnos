import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { AssetStatus, AssetType } from '../../common/enum/asset.enum';

export class UpdateAssetDto {
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
  userId?: string;
}
