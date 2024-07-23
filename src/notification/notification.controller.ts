import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from '../common/schema/notification.schema';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.delete(id);
  }
}
