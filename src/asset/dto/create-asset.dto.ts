import { IsString } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
