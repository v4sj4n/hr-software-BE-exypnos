import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import muv from 'mongoose-unique-validator';
import { AssetStatus, AssetType } from '../enum/asset.enum';
import { User } from './user.schema';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

@Schema({ _id: false })
export class AssetHistory {
  @Prop()
  @IsDate()
  updatedAt: Date;

  @Prop()
  @IsDate()
  @IsOptional()
  receive?: Date;

  @Prop()
  @IsDate()
  @IsOptional()
  returned?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  @IsOptional()
  userId?: Types.ObjectId;

  @Prop({ type: String, enum: AssetStatus })
  @IsEnum(AssetStatus)
  status: AssetStatus;
}
//SKU = Stock Keeping Unit is a unique code that identifies each asset
// Get Date is the date when the asset was receive
// Return Date is the date when the asset was returned
@Schema({ timestamps: true })
export class Asset {
  @Prop({ required: true, enum: AssetType, type: String })
  type: AssetType;

  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({ enum: AssetStatus, default: AssetStatus.AVAILABLE, type: String })
  status: AssetStatus;

  @Prop()
  receive: Date;

  @Prop()
  return: Date;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    default: null,
  })
  userId: Types.ObjectId;

  @Prop({ type: [AssetHistory], default: [] })
  history: AssetHistory[];

  @Prop({ default: false })
  isDeleted: boolean;
}
const AssetSchema = SchemaFactory.createForClass(Asset);
AssetSchema.plugin(muv);
export { AssetSchema };
