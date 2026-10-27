import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: any;

  const mockUserA = 'user-student-a';
  const mockUserB = 'user-student-b';

  const mockNotification = {
    id: 'notif-100',
    userId: mockUserA,
    type: NotificationType.ITEM_APPROVED,
    title: 'Found Item Approved',
    message: 'Your item report was approved.',
    link: '/found-items/item-100',
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. getUserNotifications returns bounded paginated notifications for authenticated user', async () => {
    prismaService.notification.findMany.mockResolvedValue([mockNotification]);
    prismaService.notification.count.mockResolvedValue(1);

    const res = await service.getUserNotifications(mockUserA, {
      page: 1,
      limit: 20,
    });

    expect(res.data).toEqual([mockNotification]);
    expect(res.pagination.total).toEqual(1);
    expect(res.pagination.page).toEqual(1);
    expect(res.pagination.limit).toEqual(20);
    expect(prismaService.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: mockUserA }),
        take: 20,
      })
    );
  });

  it('2. getUnreadCount queries database count for readAt=null', async () => {
    prismaService.notification.count.mockResolvedValue(3);

    const res = await service.getUnreadCount(mockUserA);

    expect(res.unreadCount).toEqual(3);
    expect(prismaService.notification.count).toHaveBeenCalledWith({
      where: { userId: mockUserA, readAt: null },
    });
  });

  it('3. markAsRead updates readAt for user owned notification', async () => {
    prismaService.notification.findFirst.mockResolvedValue(mockNotification);
    prismaService.notification.update.mockResolvedValue({
      ...mockNotification,
      readAt: new Date(),
    });

    const res = await service.markAsRead('notif-100', mockUserA);

    expect(res.readAt).toBeDefined();
    expect(prismaService.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 'notif-100', userId: mockUserA },
    });
  });

  it('4. IDOR Protection: User B cannot mark User A notification as read', async () => {
    prismaService.notification.findFirst.mockResolvedValue(null);

    await expect(service.markAsRead('notif-100', mockUserB)).rejects.toThrow(
      NotFoundException
    );
  });

  it('5. markAllAsRead updates only authenticated user unread notifications', async () => {
    prismaService.notification.updateMany.mockResolvedValue({ count: 4 });

    const res = await service.markAllAsRead(mockUserA);

    expect(res.count).toEqual(4);
    expect(prismaService.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: mockUserA, readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });
});
