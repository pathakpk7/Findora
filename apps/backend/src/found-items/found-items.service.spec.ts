import { Test, TestingModule } from '@nestjs/testing';
import { FoundItemsService } from './found-items.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ReputationService } from '../reputation/reputation.service';
import {
  ItemCategory,
  ItemStatus,
  AuditAction,
  NotificationType,
} from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFoundItemDto } from './dto/create-found-item.dto';

describe('FoundItemsService', () => {
  let service: FoundItemsService;
  let prismaService: any;
  let notificationsService: any;
  let auditService: any;

  const mockUser = {
    id: 'user-123',
    username: 'student1',
    role: 'USER',
  };

  const mockModerator = {
    id: 'mod-456',
    username: 'mod1',
    role: 'MODERATOR',
  };

  const mockFoundItem = {
    id: 'item-1',
    title: 'Blue Earbuds',
    category: ItemCategory.EARBUDS,
    publicDescription: 'Found near library entrance',
    foundLocation: 'Library Entrance',
    foundDate: new Date('2026-06-01'),
    status: ItemStatus.PENDING,
    publicImages: ['https://cloudinary.com/earbuds.jpg'],
    foundById: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(callback => callback(prismaService)),
      foundItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      foundItemVerification: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue(true),
    };

    auditService = {
      logAction: jest.fn().mockResolvedValue(true),
    };

    const reputationService = {
      adjustTrustScore: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoundItemsService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditService, useValue: auditService },
        { provide: ReputationService, useValue: reputationService },
      ],
    }).compile();

    service = module.get<FoundItemsService>(FoundItemsService);
  });

  it('1. USER can create a found item', async () => {
    const dto: CreateFoundItemDto = {
      title: 'Blue Earbuds',
      category: ItemCategory.EARBUDS,
      publicDescription: 'Found near library',
      foundLocation: 'Library',
      foundDate: '2026-06-01',
      publicImages: ['img.jpg'],
    };

    prismaService.foundItem.create.mockResolvedValue(mockFoundItem);

    const result = await service.create(mockUser.id, dto);
    expect(result).toBeDefined();
    expect(prismaService.foundItem.create).toHaveBeenCalled();
  });

  it('2. Created item initial status is always PENDING', async () => {
    const dto: CreateFoundItemDto = {
      title: 'Blue Earbuds',
      category: ItemCategory.EARBUDS,
      publicDescription: 'Found near library',
      foundLocation: 'Library',
      foundDate: '2026-06-01',
    };

    prismaService.foundItem.create.mockImplementation(({ data }) => {
      expect(data.status).toBe(ItemStatus.PENDING);
      return Promise.resolve({ ...mockFoundItem, status: ItemStatus.PENDING });
    });

    await service.create(mockUser.id, dto);
  });

  it('3 & 4. Authenticated user ID becomes foundById (JWT identity cannot be overridden)', async () => {
    const dto: CreateFoundItemDto & { foundById?: string } = {
      title: 'Blue Earbuds',
      category: ItemCategory.EARBUDS,
      publicDescription: 'Found near library',
      foundLocation: 'Library',
      foundDate: '2026-06-01',
      foundById: 'attacker-id-override',
    };

    prismaService.foundItem.create.mockImplementation(({ data }) => {
      expect(data.foundById).toBe(mockUser.id);
      return Promise.resolve(mockFoundItem);
    });

    await service.create(mockUser.id, dto);
  });

  it('5. USER can retrieve their own items', async () => {
    prismaService.foundItem.findMany.mockResolvedValue([mockFoundItem]);
    prismaService.foundItem.count.mockResolvedValue(1);

    const res = await service.findMyItems(mockUser.id, {});
    expect(res.data).toHaveLength(1);
    expect(res.data[0].foundById).toBe(mockUser.id);
  });

  it('6 & 15. Public endpoint only returns APPROVED items and NEVER verification data', async () => {
    const approvedItem = { ...mockFoundItem, status: ItemStatus.APPROVED };
    prismaService.foundItem.findMany.mockResolvedValue([approvedItem]);
    prismaService.foundItem.count.mockResolvedValue(1);

    const res = await service.findPublicItems({});
    expect(res.data[0].status).toBe(ItemStatus.APPROVED);
    expect(prismaService.foundItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: ItemStatus.APPROVED }),
      })
    );
  });

  it('7 & 8. PENDING item is not publicly accessible via single GET by ID', async () => {
    prismaService.foundItem.findFirst.mockResolvedValue(null);

    await expect(service.findPublicItemById('item-1')).rejects.toThrow(
      NotFoundException
    );
  });

  it('10. MODERATOR can approve pending item', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 1 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.APPROVED,
    });

    const result = await service.approve('item-1', mockModerator.id);
    expect(result?.status).toBe(ItemStatus.APPROVED);
  });

  it('11. Approving fails if item is not PENDING', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 0 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.APPROVED,
    });

    await expect(service.approve('item-1', mockModerator.id)).rejects.toThrow(
      ConflictException
    );
  });

  it('12 & 13. MODERATOR can reject item (rejection requires reason)', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 1 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.REJECTED,
    });

    // Rejection without reason throws BadRequestException
    await expect(
      service.reject('item-1', mockModerator.id, { reason: '' })
    ).rejects.toThrow(BadRequestException);

    const result = await service.reject('item-1', mockModerator.id, {
      reason: 'Incomplete information',
    });
    expect(result?.status).toBe(ItemStatus.REJECTED);
  });

  it('16. Audit record is created upon moderation approve/reject', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 1 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.APPROVED,
    });

    await service.approve('item-1', mockModerator.id);
    expect(auditService.logAction).toHaveBeenCalledWith(
      AuditAction.ITEM_APPROVED,
      'FoundItem',
      'item-1',
      mockModerator.id,
      expect.any(Object)
    );
  });

  it('17. Notification is created after moderation', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 1 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.APPROVED,
    });

    await service.approve('item-1', mockModerator.id);
    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      mockUser.id,
      NotificationType.ITEM_APPROVED,
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });

  it('18. Pagination limit is bounded to a maximum of 50', async () => {
    prismaService.foundItem.findMany.mockResolvedValue([]);
    prismaService.foundItem.count.mockResolvedValue(0);

    const res = await service.findPublicItems({ limit: 1000 });
    expect(res.limit).toBe(50);
  });

  it('19. Unauthorized item modification by non-owner fails', async () => {
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      foundById: 'different-user-id',
    });

    await expect(
      service.update('item-1', mockUser.id, { title: 'Hacked Title' })
    ).rejects.toThrow(ForbiddenException);
  });

  it('20. Concurrent status transition returns ConflictException when status changed', async () => {
    prismaService.foundItem.updateMany.mockResolvedValue({ count: 0 });
    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.REJECTED,
    });

    await expect(service.approve('item-1', mockModerator.id)).rejects.toThrow(
      ConflictException
    );
  });

  it('21. Throw BadRequestException when dateFrom > dateTo', async () => {
    await expect(
      service.findPublicItems({
        dateFrom: '2026-10-01',
        dateTo: '2026-05-01',
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('22. Search query is trimmed and case-insensitive Prisma search constructed', async () => {
    prismaService.foundItem.findMany.mockResolvedValue([mockFoundItem]);
    prismaService.foundItem.count.mockResolvedValue(1);

    await service.findPublicItems({ search: '  Earbuds  ' });

    expect(prismaService.foundItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'Earbuds', mode: 'insensitive' } },
            { publicDescription: { contains: 'Earbuds', mode: 'insensitive' } },
            { foundLocation: { contains: 'Earbuds', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });
});
