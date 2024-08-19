import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationType } from '../enum/notification.enum';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, enum: NotificationType, type: String })
  type: NotificationType;

  @Prop({ required: true })
  typeId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ default: false, type: Boolean })
  isShown: boolean;

  @Prop({ default: false, type: Boolean })
  isRead: boolean;

  @Prop({ default: false, type: Boolean })
  isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
