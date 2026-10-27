import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Internal helper to create a persistent notification for a user
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link: link || null,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to create notification for user ${userId}: ${error?.message || error}`
      );
    }
  }

  /**
   * Get user's notifications with bounded pagination and optional filtering
   */
  async getUserNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ) {
    const rawLimit = Number(options.limit) || 20;
    const limit = Math.min(Math.max(rawLimit, 1), 50);
    const page = Math.max(Number(options.page) || 1, 1);
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (typeof options.read === 'boolean') {
      where.readAt = options.read ? { not: null } : null;
    }

    if (
      options.type &&
      Object.values(NotificationType).includes(options.type)
    ) {
      where.type = options.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get fast unread count for current user
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
    return { unreadCount };
  }

  /**
   * Mark a single notification as read (IDOR protected)
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    if (!notification.readAt) {
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { readAt: new Date() },
      });
    }

    return notification;
  }

  /**
   * Mark all unread notifications as read for current user
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }
}
