import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { LostReportsService } from './lost-reports.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ItemCategory, LostReportStatus, Role } from '@prisma/client';
import { CreateLostReportDto } from './dto/create-lost-report.dto';

describe('LostReportsService', () => {
  let service: LostReportsService;
  let prismaService: any;
  let notificationsService: any;

  const mockUser = { id: 'user-123', role: Role.USER };
  const mockOtherUser = { id: 'user-456', role: Role.USER };
  const mockModerator = { id: 'mod-1', role: Role.MODERATOR };

  const mockLostReport = {
    id: 'report-123',
    reporterId: mockUser.id,
    title: 'Lost Blue Backpack',
    category: ItemCategory.BAG,
    description: 'Left in Room 302',
    lostLocation: 'Building A Room 302',
    lostDate: new Date('2026-09-01'),
    images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    identifyingCharacteristics: 'Sticker on front pocket',
    status: LostReportStatus.ACTIVE,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      lostReport: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LostReportsService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<LostReportsService>(LostReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. USER can create own lost report starting in ACTIVE status', async () => {
    const dto: CreateLostReportDto = {
      title: 'Lost Blue Backpack',
      category: ItemCategory.BAG,
      description: 'Left in Room 302',
      lostLocation: 'Building A Room 302',
      lostDate: '2026-09-01',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    };

    prismaService.lostReport.create.mockResolvedValue(mockLostReport);

    const result = await service.create(mockUser.id, dto);

    expect(result).toBeDefined();
    expect(result.status).toBe(LostReportStatus.ACTIVE);
    expect(prismaService.lostReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reporterId: mockUser.id,
          status: LostReportStatus.ACTIVE,
        }),
      })
    );
  });

  it('2 & 3. reporterId comes from JWT and cannot be overridden by payload', async () => {
    const dto: CreateLostReportDto & { reporterId?: string } = {
      title: 'Lost Blue Backpack',
      category: ItemCategory.BAG,
      description: 'Left in Room 302',
      lostLocation: 'Building A Room 302',
      lostDate: '2026-09-01',
      reporterId: 'attacker-id',
    };

    prismaService.lostReport.create.mockImplementation(({ data }) => {
      expect(data.reporterId).toBe(mockUser.id);
      return Promise.resolve(mockLostReport);
    });

    await service.create(mockUser.id, dto);
  });

  it('5. USER can retrieve own lost reports', async () => {
    prismaService.lostReport.findMany.mockResolvedValue([mockLostReport]);
    prismaService.lostReport.count.mockResolvedValue(1);

    const res = await service.findMyReports(mockUser.id, {});

    expect(res.data).toHaveLength(1);
    expect(res.data[0].reporterId).toBe(mockUser.id);
  });

  it('6. USER cannot retrieve another user lost report (IDOR security check)', async () => {
    prismaService.lostReport.findUnique.mockResolvedValue(mockLostReport);

    await expect(
      service.findOne('report-123', mockOtherUser.id, mockOtherUser.role)
    ).rejects.toThrow(ForbiddenException);
  });

  it('7. MODERATOR can retrieve any lost report', async () => {
    prismaService.lostReport.findUnique.mockResolvedValue(mockLostReport);

    const res = await service.findOne(
      'report-123',
      mockModerator.id,
      mockModerator.role
    );
    expect(res.id).toBe('report-123');
  });

  it('8. USER can update own ACTIVE lost report', async () => {
    prismaService.lostReport.findUnique.mockResolvedValue(mockLostReport);
    prismaService.lostReport.update.mockResolvedValue({
      ...mockLostReport,
      title: 'Updated Backpack Title',
    });

    const res = await service.update('report-123', mockUser.id, {
      title: 'Updated Backpack Title',
    });

    expect(res.title).toBe('Updated Backpack Title');
  });

  it('9. USER cannot update non-ACTIVE lost report', async () => {
    prismaService.lostReport.findUnique.mockResolvedValue({
      ...mockLostReport,
      status: LostReportStatus.CLOSED,
    });

    await expect(
      service.update('report-123', mockUser.id, { title: 'New Title' })
    ).rejects.toThrow(BadRequestException);
  });

  it('10 & 11. USER can CANCEL own report but cannot set MATCHED directly', async () => {
    prismaService.lostReport.findUnique.mockResolvedValue(mockLostReport);

    await expect(
      service.updateStatus(
        'report-123',
        mockUser.id,
        mockUser.role,
        LostReportStatus.MATCHED
      )
    ).rejects.toThrow(ForbiddenException);

    prismaService.lostReport.update.mockResolvedValue({
      ...mockLostReport,
      status: LostReportStatus.CANCELLED,
    });

    const res = await service.updateStatus(
      'report-123',
      mockUser.id,
      mockUser.role,
      LostReportStatus.CANCELLED
    );

    expect(res.status).toBe(LostReportStatus.CANCELLED);
  });

  it('12. Pagination limit is bounded to a maximum of 50', async () => {
    prismaService.lostReport.findMany.mockResolvedValue([]);
    prismaService.lostReport.count.mockResolvedValue(0);

    const res = await service.findMyReports(mockUser.id, { limit: 1000 });
    expect(res.limit).toBe(50);
  });
});
