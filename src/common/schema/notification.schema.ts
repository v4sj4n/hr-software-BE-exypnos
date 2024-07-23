import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../enum/notification.enum';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  type: NotificationType;

  @Prop({ default: new Date() })
  date: Date;

  @Prop({ required: true })
  typeId: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
