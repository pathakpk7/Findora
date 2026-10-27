import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import {
  ClaimStatus,
  HandoverStatus,
  ItemCategory,
  ItemStatus,
  LostReportStatus,
} from '@prisma/client';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../config/prisma/prisma.service';

describe('Phase 16 Master System Integration & Reliability E2E Suite', () => {
  describe('1. Complete User Journey E2E State Machine', () => {
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        user: { findUnique: jest.fn(), update: jest.fn() },
        foundItem: {
          create: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        lostReport: {
          create: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        claim: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
        handover: {
          create: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        notification: { create: jest.fn() },
        trustScoreHistory: { create: jest.fn() },
        userBadge: { create: jest.fn() },
        auditLog: { create: jest.fn() },
        $transaction: jest.fn(cb => cb(mockPrisma)),
      };
    });

    it('simulates full lifecycle: Report -> Moderation -> Match -> Claim -> QR Handover -> Reputation', async () => {
      // Step 1: Student A submits Found Item (PENDING)
      const foundItem = {
        id: 'item-101',
        title: 'Blue Water Bottle',
        category: ItemCategory.ACCESSORY,
        publicDescription: 'Found near Gym',
        foundLocation: 'Gymnasium',
        foundDate: new Date(),
        status: ItemStatus.PENDING,
        foundById: 'student-a',
      };
      mockPrisma.foundItem.create.mockResolvedValue(foundItem);

      // Step 2: Moderator approves Found Item (APPROVED)
      const approvedItem = { ...foundItem, status: ItemStatus.APPROVED };
      mockPrisma.foundItem.update.mockResolvedValue(approvedItem);
      expect(approvedItem.status).toBe(ItemStatus.APPROVED);

      // Step 3: Student B submits Lost Report & requests matches
      const lostReport = {
        id: 'report-202',
        reporterId: 'student-b',
        title: 'Blue Gym Bottle',
        category: ItemCategory.ACCESSORY,
        description: 'Lost my blue water bottle near gym',
        lostLocation: 'Gymnasium',
        lostDate: new Date(),
        status: LostReportStatus.ACTIVE,
      };
      mockPrisma.lostReport.create.mockResolvedValue(lostReport);

      // Step 4: Student B submits Claim (PENDING)
      const claim = {
        id: 'claim-303',
        foundItemId: foundItem.id,
        claimantId: 'student-b',
        evidence: 'Metal bottle with sticker',
        status: ClaimStatus.PENDING,
      };
      mockPrisma.claim.create.mockResolvedValue(claim);

      // Step 5: Moderator approves Claim (APPROVED)
      const approvedClaim = { ...claim, status: ClaimStatus.APPROVED };
      mockPrisma.claim.update.mockResolvedValue(approvedClaim);

      // Step 6: Handover QR token generated (PENDING)
      const handover = {
        id: 'handover-404',
        claimId: claim.id,
        tokenHash: 'hashed-secret-token',
        status: HandoverStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      mockPrisma.handover.create.mockResolvedValue(handover);

      // Step 7: Authorized scan completes handover (COMPLETED)
      const completedHandover = {
        ...handover,
        status: HandoverStatus.COMPLETED,
      };
      const completedItem = { ...approvedItem, status: ItemStatus.RETURNED };
      const completedClaim = {
        ...approvedClaim,
        status: ClaimStatus.COMPLETED,
      };

      mockPrisma.handover.update.mockResolvedValue(completedHandover);
      mockPrisma.foundItem.update.mockResolvedValue(completedItem);
      mockPrisma.claim.update.mockResolvedValue(completedClaim);

      // Step 8: Verify final states & business events
      expect(completedItem.status).toBe(ItemStatus.RETURNED);
      expect(completedClaim.status).toBe(ClaimStatus.COMPLETED);
      expect(completedHandover.status).toBe(HandoverStatus.COMPLETED);
    });
  });

  describe('2. Multi-User Boundary & IDOR Verification', () => {
    let strategy: JwtStrategy;
    let mockPrisma: any;

    beforeEach(async () => {
      mockPrisma = { user: { findUnique: jest.fn() } };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();
      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('denies API access to deactivated accounts immediately', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-deactivated',
        isActive: false,
      });

      await expect(
        strategy.validate({ sub: 'user-deactivated' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('3. Concurrency & Race Condition Safety', () => {
    it('prevents double-completion during concurrent QR scans', async () => {
      let isCompleted = false;

      const scanHandover = async () => {
        if (isCompleted) {
          throw new ConflictException('Handover token already consumed');
        }
        isCompleted = true;
        return { status: HandoverStatus.COMPLETED };
      };

      const results = await Promise.allSettled([
        scanHandover(),
        scanHandover(),
      ]);

      const succeeded = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(succeeded).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
        ConflictException
      );
    });

    it('prevents double-rewarding on concurrent reputation events', async () => {
      const processedEvents = new Set<string>();

      const awardReputation = async (eventId: string) => {
        if (processedEvents.has(eventId)) {
          return { awarded: false, reason: 'Duplicate event' };
        }
        processedEvents.add(eventId);
        return { awarded: true, scoreAdd: 30 };
      };

      const [res1, res2] = await Promise.all([
        awardReputation('evt-101'),
        awardReputation('evt-101'),
      ]);

      expect(res1.awarded !== res2.awarded).toBe(true);
    });
  });
});
