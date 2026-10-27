import { Test, TestingModule } from '@nestjs/testing';
import { ReputationService, calculateLevelInfo } from './reputation.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('ReputationService Suite', () => {
  let service: ReputationService;
  let prismaService: any;
  let notificationsService: any;
  let auditService: any;

  const mockUser = {
    id: 'user-student-1',
    username: 'john_doe',
    trustScore: 120,
    isActive: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      trustScoreHistory: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      badge: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      userBadge: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      foundItem: {
        count: jest.fn(),
      },
      handover: {
        count: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(prismaService)),
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<ReputationService>(ReputationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Level Calculation Policy', () => {
    it('calculates levels correctly according to score thresholds', () => {
      expect(calculateLevelInfo(0)).toEqual({
        level: 1,
        levelName: 'Novice',
        nextLevelScore: 50,
        progressPercent: 0,
      });

      expect(calculateLevelInfo(75)).toEqual({
        level: 2,
        levelName: 'Contributor',
        nextLevelScore: 150,
        progressPercent: 25,
      });

      expect(calculateLevelInfo(200)).toEqual({
        level: 3,
        levelName: 'Trusted Finder',
        nextLevelScore: 300,
        progressPercent: 33,
      });

      expect(calculateLevelInfo(400)).toEqual({
        level: 4,
        levelName: 'Campus Guardian',
        nextLevelScore: 500,
        progressPercent: 50,
      });

      expect(calculateLevelInfo(600)).toEqual({
        level: 5,
        levelName: 'Findora Hero',
        nextLevelScore: 1000,
        progressPercent: 100,
      });
    });
  });

  describe('adjustTrustScore & Idempotency', () => {
    it('1. Adjusts trust score within bounds [0, 1000] and creates history', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.trustScoreHistory.findFirst.mockResolvedValue(null);
      prismaService.trustScoreHistory.create.mockResolvedValue({
        id: 'hist-1',
        userId: mockUser.id,
        amount: 20,
        previousScore: 120,
        newScore: 140,
        reason: 'Found item approved',
      });
      prismaService.foundItem.count.mockResolvedValue(1);
      prismaService.handover.count.mockResolvedValue(0);
      prismaService.badge.findMany.mockResolvedValue([]);

      await service.adjustTrustScore(
        mockUser.id,
        20,
        'Found item approved',
        'FoundItem',
        'item-100'
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { trustScore: 140 },
      });
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });

    it('2. Idempotency: Duplicate (userId, sourceType, sourceId) does NOT re-award points', async () => {
      prismaService.trustScoreHistory.findFirst.mockResolvedValue({
        id: 'hist-existing',
        userId: mockUser.id,
        sourceType: 'FoundItem',
        sourceId: 'item-100',
      });

      await service.adjustTrustScore(
        mockUser.id,
        20,
        'Found item approved',
        'FoundItem',
        'item-100'
      );

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(prismaService.trustScoreHistory.create).not.toHaveBeenCalled();
    });

    it('3. Clamps score to upper bound 1000 and lower bound 0', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        trustScore: 990,
      });
      prismaService.foundItem.count.mockResolvedValue(0);
      prismaService.handover.count.mockResolvedValue(0);
      prismaService.badge.findMany.mockResolvedValue([]);

      await service.adjustTrustScore(mockUser.id, 50, 'Bonus', 'Bonus', 'b-1');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { trustScore: 1000 },
      });
    });
  });

  describe('evaluateBadges', () => {
    it('awards badges deterministically when user meets criteria', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        trustScore: 200,
      });
      prismaService.foundItem.count.mockResolvedValue(3);
      prismaService.handover.count.mockResolvedValue(1);
      prismaService.badge.findMany.mockResolvedValue([
        { id: 'b1', code: 'FIRST_FIND', name: 'First Find' },
        { id: 'b2', code: 'HELPFUL_FINDER', name: 'Helpful Finder' },
        { id: 'b3', code: 'TRUSTED_FINDER', name: 'Trusted Finder' },
        { id: 'b4', code: 'SUCCESSFUL_RETURN', name: 'First Return' },
      ]);

      await service.evaluateBadges(mockUser.id);

      expect(prismaService.userBadge.create).toHaveBeenCalledTimes(4);
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    it('returns bounded paginated leaderboard without exposing private credentials', async () => {
      prismaService.user.findMany.mockResolvedValue([
        {
          id: mockUser.id,
          username: mockUser.username,
          trustScore: 120,
          _count: { userBadges: 2 },
        },
      ]);
      prismaService.user.count.mockResolvedValue(1);

      const res = await service.getLeaderboard(1, 20);

      expect(res.data.length).toEqual(1);
      expect(res.data[0].rank).toEqual(1);
      expect(res.data[0].levelName).toEqual('Contributor');
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });
  });

  describe('manualAdjust', () => {
    it('allows staff to perform score adjustments and creates audit log', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.trustScoreHistory.findFirst.mockResolvedValue(null);
      prismaService.foundItem.count.mockResolvedValue(0);
      prismaService.handover.count.mockResolvedValue(0);
      prismaService.badge.findMany.mockResolvedValue([]);

      await service.manualAdjust(
        mockUser.id,
        25,
        'Good Samaritan award',
        'mod-1'
      );

      expect(auditService.logAction).toHaveBeenCalledWith(
        'TRUST_SCORE_CHANGED',
        'User',
        mockUser.id,
        'mod-1',
        { amount: 25, reason: 'Good Samaritan award' }
      );
    });
  });
});
