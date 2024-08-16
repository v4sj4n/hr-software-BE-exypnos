import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
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

  @Get('user/:id')
  findByUserId(@Param('id') id: string): Promise<Notification[]> {
    return this.notificationService.getNotificationsByUserId(id);
  }
}
