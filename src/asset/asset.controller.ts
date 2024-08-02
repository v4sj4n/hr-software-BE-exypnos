import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }

  @Get()
  findAll(@Query("page") page: number, @Query("limit") limit: number) {
    return this.assetService.findAllPaginate(page, limit);
  }

  @Get('user')
  findAllWithUsers() {
    return this.assetService.getAllUserWithAssets();
  }

  @Get('user/:id')
  findAllWithUsersById(@Param('id') id: string) {
    return this.assetService.getUserWithAssets(id);
  }

  @Get('sn/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.assetService.getAssetBySerialNumber(serialNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.assetService.getAssetHistory(id);
  }
}
