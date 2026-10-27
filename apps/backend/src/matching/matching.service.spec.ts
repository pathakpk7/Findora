import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  ItemCategory,
  ItemStatus,
  MatchConfidence,
  MatchSource,
  Role,
} from '@prisma/client';
import { MatchingService } from './matching.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { GeminiMatchingProvider } from './providers/gemini-matching.provider';
import { RuleBasedMatchingProvider } from './providers/rule-based-matching.provider';
import { NotificationsService } from '../notifications/notifications.service';

describe('MatchingService (unit)', () => {
  let service: MatchingService;
  let mockPrisma: any;
  let mockGeminiProvider: any;
  let ruleBasedProvider: RuleBasedMatchingProvider;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockPrisma = {
      lostReport: {
        findUnique: jest.fn(),
      },
      foundItem: {
        findMany: jest.fn(),
      },
      lostReportMatch: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(mockPrisma)),
    };

    mockGeminiProvider = {
      findMatches: jest.fn(),
    };

    mockNotificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    ruleBasedProvider = new RuleBasedMatchingProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GeminiMatchingProvider, useValue: mockGeminiProvider },
        { provide: RuleBasedMatchingProvider, useValue: ruleBasedProvider },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  afterEach(() => jest.resetAllMocks());

  it('should throw NotFoundException if lost report does not exist', async () => {
    mockPrisma.lostReport.findUnique.mockResolvedValue(null);

    await expect(
      service.findMatchesForLostReport('invalid-id', 'u1', Role.USER, {})
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if requester is an unrelated user (IDOR protection)', async () => {
    mockPrisma.lostReport.findUnique.mockResolvedValue({
      id: 'lr-1',
      reporterId: 'user-owner',
    });

    await expect(
      service.findMatchesForLostReport('lr-1', 'user-unrelated', Role.USER, {})
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return stored matches if present and forceRefresh is false', async () => {
    mockPrisma.lostReport.findUnique.mockResolvedValue({
      id: 'lr-1',
      reporterId: 'user-owner',
    });

    const storedMatches = [
      {
        id: 'm1',
        lostReportId: 'lr-1',
        foundItemId: 'fi-1',
        score: 85,
        confidence: MatchConfidence.HIGH,
        source: MatchSource.AI,
        reasons: ['Matching category'],
        foundItem: { id: 'fi-1', title: 'Found Phone' },
      },
    ];
    mockPrisma.lostReportMatch.findMany.mockResolvedValue(storedMatches);

    const res = await service.findMatchesForLostReport(
      'lr-1',
      'user-owner',
      Role.USER,
      { forceRefresh: false }
    );

    expect(res.count).toBe(1);
    expect(res.source).toBe(MatchSource.AI);
    expect(res.matches).toHaveLength(1);
    expect(res.disclaimer).toContain('AI-assisted suggestion');
  });

  it('should compute matches using RuleBasedMatchingProvider when Gemini fails', async () => {
    mockPrisma.lostReport.findUnique.mockResolvedValue({
      id: 'lr-1',
      reporterId: 'user-owner',
      category: ItemCategory.PHONE,
      title: 'iPhone 13 Black',
      description: 'Lost near campus library',
      lostLocation: 'Library',
      lostDate: new Date(),
    });

    mockPrisma.lostReportMatch.findMany.mockResolvedValue([]);
    mockPrisma.foundItem.findMany.mockResolvedValue([
      {
        id: 'fi-1',
        category: ItemCategory.PHONE,
        title: 'Black iPhone 13',
        publicDescription: 'Found near central library study area',
        foundLocation: 'Library',
        foundDate: new Date(),
        status: ItemStatus.APPROVED,
      },
    ]);

    mockGeminiProvider.findMatches.mockRejectedValue(
      new Error('API Key Missing')
    );
    mockPrisma.lostReportMatch.upsert.mockImplementation(({ create }) =>
      Promise.resolve({
        ...create,
        id: 'm-new',
        foundItem: { id: 'fi-1', title: 'Black iPhone 13' },
      })
    );

    const res = await service.findMatchesForLostReport(
      'lr-1',
      'user-owner',
      Role.USER,
      { forceRefresh: true }
    );

    expect(res.count).toBe(1);
    expect(res.source).toBe(MatchSource.RULE_BASED);
    expect(res.matches[0].score).toBeGreaterThanOrEqual(70);
    expect(res.matches[0].confidence).toBe(MatchConfidence.HIGH);
  });

  it('should compute matches using Gemini provider when available', async () => {
    mockPrisma.lostReport.findUnique.mockResolvedValue({
      id: 'lr-1',
      reporterId: 'user-owner',
      category: ItemCategory.EARBUDS,
      title: 'AirPods Pro Case',
      description: 'White charging case',
      lostLocation: 'Student Union',
      lostDate: new Date(),
    });

    mockPrisma.lostReportMatch.findMany.mockResolvedValue([]);
    mockPrisma.foundItem.findMany.mockResolvedValue([
      {
        id: 'fi-2',
        category: ItemCategory.EARBUDS,
        title: 'Apple AirPods Case',
        publicDescription: 'White wireless charging case found at food court',
        foundLocation: 'Student Union',
        foundDate: new Date(),
        status: ItemStatus.APPROVED,
      },
    ]);

    mockGeminiProvider.findMatches.mockResolvedValue([
      {
        foundItemId: 'fi-2',
        score: 90,
        confidence: MatchConfidence.HIGH,
        reasons: ['Exact category match', 'Same location'],
        source: MatchSource.AI,
      },
    ]);

    mockPrisma.lostReportMatch.upsert.mockImplementation(({ create }) =>
      Promise.resolve({
        ...create,
        id: 'm-ai',
        foundItem: { id: 'fi-2', title: 'Apple AirPods Case' },
      })
    );

    const res = await service.findMatchesForLostReport(
      'lr-1',
      'user-owner',
      Role.USER,
      { forceRefresh: true }
    );

    expect(res.count).toBe(1);
    expect(res.source).toBe(MatchSource.AI);
    expect(res.matches[0].score).toBe(90);
    expect(res.matches[0].confidence).toBe(MatchConfidence.HIGH);
  });
});
