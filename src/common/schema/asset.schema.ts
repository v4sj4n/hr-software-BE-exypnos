import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AssetType {
  LAPTOP = 'laptop',
  MONITOR = 'monitor',
  DESKTOP = 'desktop',
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
}
//SKU = Stock Keeping Unit is a unique code that identifies each asset
@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true, enum: AssetType })
  type: AssetType;

  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: '000000000000000000000000',
  })
  userId: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
