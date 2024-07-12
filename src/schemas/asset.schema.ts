import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as muv from 'mongoose-unique-validator';


export enum AssetType {
  LAPTOP = 'laptop',
  MONITOR = 'monitor',
}
export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  BROKEN = 'broken',
  RETURNED = 'returned',
  LOST = 'lost',
  STOLEN = 'stolen',
  IN_REPAIR = 'in-repair',
  IN_MAINTENANCE = 'in-maintenance',
}
//SKU = Stock Keeping Unit is a unique code that identifies each asset
// Get Date is the date when the asset was received
// Return Date is the date when the asset was returned
@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true, enum: AssetType })
  type: AssetType;

  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({ enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Prop()
  receivedDate: Date;

  @Prop()
  returnDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  userId: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset).plugin(muv);


