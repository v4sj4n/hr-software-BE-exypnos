import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { Asset, AssetSchema } from '../schemas/asset.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
