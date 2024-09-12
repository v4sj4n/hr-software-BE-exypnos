import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../common/schema/notification.schema';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<Notification[]> {
    return this.notificationService.findAll(page, limit);
  }
  @Get('user/:id')
  findByUserId(
    @Param('id') id: string,
    @Query('isRead') isRead: boolean,
  ): Promise<Notification[]> {
    return this.notificationService.getNotificationsByUserId(id, isRead);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(id);
  }
  @Patch(':id')
  updateNotification(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.update(id);
  }
}
