import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto'; // Corrected import path
import { UpdateAssetDto } from './dto/update-asset.dto'; // Corrected import path

@Injectable()
export class AssetService {
  private assets = [];

  create(createAssetDto: CreateAssetDto) {
    this.assets.push(createAssetDto);
    return createAssetDto;
  }

  findAll() {
    return this.assets;
  }

  findOne(id: string) {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return asset;
  }

  update(id: string, updateAssetDto: UpdateAssetDto) {
    const assetIndex = this.assets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    this.assets[assetIndex] = updateAssetDto;
    return updateAssetDto;
  }

  remove(id: string) {
    const assetIndex = this.assets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
    return this.assets.splice(assetIndex, 1);
  }
}
