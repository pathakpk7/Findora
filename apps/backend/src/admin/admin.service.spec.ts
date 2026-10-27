import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, Role } from '@prisma/client';

describe('AdminService Suite', () => {
  let service: AdminService;
  let prismaService: any;
  let auditService: any;

  const mockAdminId = 'admin-user-1';
  const mockTargetUserId = 'user-student-2';

  const mockUser = {
    id: mockTargetUserId,
    username: 'student_john',
    email: 'john@college.edu',
    role: Role.USER,
    isVerified: false,
    isActive: true,
    trustScore: 100,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      user: {
        count: jest.fn().mockResolvedValue(10),
        groupBy: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({
          _avg: { trustScore: 100 },
          _max: { trustScore: 300 },
        }),
        findMany: jest.fn().mockResolvedValue([mockUser]),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        update: jest
          .fn()
          .mockResolvedValue({ ...mockUser, role: Role.MODERATOR }),
      },
      foundItem: {
        count: jest.fn().mockResolvedValue(5),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      lostReport: {
        count: jest.fn().mockResolvedValue(4),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      claim: {
        count: jest.fn().mockResolvedValue(3),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      handover: {
        count: jest.fn().mockResolvedValue(2),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      userBadge: {
        count: jest.fn().mockResolvedValue(8),
      },
      auditLog: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Overview Analytics', () => {
    it('1. Calculates aggregate metrics cleanly', async () => {
      const res = await service.getOverviewAnalytics({});

      expect(res.users.total).toEqual(10);
      expect(res.foundItems.total).toEqual(5);
      expect(res.lostReports.total).toEqual(4);
      expect(res.claims.total).toEqual(3);
      expect(res.handovers.total).toEqual(2);
      expect(res.reputation.avgTrustScore).toEqual(100);
    });
  });

  describe('User Management Actions', () => {
    it('2. Admin updates user role and logs AuditAction.ROLE_CHANGED', async () => {
      await service.updateUserRole(
        mockTargetUserId,
        Role.MODERATOR,
        mockAdminId
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockTargetUserId },
        data: { role: Role.MODERATOR },
        select: expect.any(Object),
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        AuditAction.ROLE_CHANGED,
        'User',
        mockTargetUserId,
        mockAdminId,
        { previousRole: Role.USER, newRole: Role.MODERATOR }
      );
    });

    it('3. Prevents admin from self-demoting', async () => {
      await expect(
        service.updateUserRole(mockAdminId, Role.USER, mockAdminId)
      ).rejects.toThrow(ConflictException);
    });

    it('4. Admin toggles user verification status and audits change', async () => {
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });

      await service.updateUserVerify(mockTargetUserId, true, mockAdminId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockTargetUserId },
        data: { isVerified: true },
        select: expect.any(Object),
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        AuditAction.USER_VERIFIED,
        'User',
        mockTargetUserId,
        mockAdminId,
        { previousVerification: false, newVerification: true }
      );
    });

    it('5. Admin deactivates user and logs USER_DEACTIVATED', async () => {
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await service.updateUserStatus(
        mockTargetUserId,
        false,
        'Spam account',
        mockAdminId
      );

      expect(auditService.logAction).toHaveBeenCalledWith(
        AuditAction.USER_DEACTIVATED,
        'User',
        mockTargetUserId,
        mockAdminId,
        { previousState: true, newState: false, reason: 'Spam account' }
      );
    });
  });

  describe('User Listing & Filtering', () => {
    it('6. getUsers returns paginated user list with capped limit', async () => {
      const res = await service.getUsers({ page: '1', limit: '100' });

      expect(res.pagination.limit).toEqual(50);
      expect(res.data.length).toEqual(1);
    });
  });

  describe('Audit Logs Viewer', () => {
    it('7. getAuditLogs returns paginated audit log stream', async () => {
      prismaService.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          action: AuditAction.ROLE_CHANGED,
          entityType: 'User',
          entityId: mockTargetUserId,
          createdAt: new Date(),
          actor: { id: mockAdminId, username: 'admin' },
        },
      ]);

      const res = await service.getAuditLogs({ page: '1', limit: '20' });

      expect(res.data.length).toEqual(1);
      expect(res.data[0].action).toEqual(AuditAction.ROLE_CHANGED);
    });
  });
});
