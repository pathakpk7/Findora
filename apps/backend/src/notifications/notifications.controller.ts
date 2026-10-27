import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('read') read?: string,
    @Query('type') type?: NotificationType
  ) {
    const readBool =
      read === 'true' ? true : read === 'false' ? false : undefined;

    const result = await this.notificationsService.getUserNotifications(
      req.user.id,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        read: readBool,
        type,
      }
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const data = await this.notificationsService.getUnreadCount(req.user.id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(id, req.user.id);
    return {
      success: true,
      message: 'Notification marked as read',
      data,
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const data = await this.notificationsService.markAllAsRead(req.user.id);
    return {
      success: true,
      message: 'All unread notifications marked as read',
      data,
    };
  }
}
