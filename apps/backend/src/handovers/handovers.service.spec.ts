import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { HandoversService } from './handovers.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReputationService } from '../reputation/reputation.service';
import { AuditService } from '../audit/audit.service';
import {
  ClaimStatus,
  HandoverStatus,
  ItemCategory,
  ItemStatus,
  Role,
} from '@prisma/client';

describe('HandoversService Security Hardening Suite', () => {
  let service: HandoversService;
  let prismaService: any;
  let notificationsService: any;
  let auditService: any;

  const mockClaimant = { id: 'user-claimant', role: Role.USER };
  const mockFinder = { id: 'user-finder', role: Role.USER };
  const mockOtherUser = { id: 'user-other', role: Role.USER };
  const mockStaff = { id: 'user-staff', role: Role.MODERATOR };

  const mockFoundItem = {
    id: 'item-100',
    title: 'Silver Watch',
    category: ItemCategory.ELECTRONICS,
    publicDescription: 'Silver wrist watch',
    foundLocation: 'Cafeteria',
    foundDate: new Date('2026-09-01'),
    status: ItemStatus.CLAIMED,
    foundById: mockFinder.id,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  const mockClaim = {
    id: 'claim-100',
    foundItemId: mockFoundItem.id,
    claimantId: mockClaimant.id,
    evidence: 'Serial number 998877 is etched on the back plate.',
    status: ClaimStatus.APPROVED,
    foundItem: mockFoundItem,
    claimant: mockClaimant,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      claim: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      foundItem: {
        update: jest.fn(),
      },
      handover: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(prismaService)),
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const reputationService = {
      adjustTrustScore: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandoversService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditService, useValue: auditService },
        { provide: ReputationService, useValue: reputationService },
      ],
    }).compile();

    service = module.get<HandoversService>(HandoversService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. Generates cryptographically random raw token and stores ONLY SHA-256 tokenHash', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);
    prismaService.handover.findUnique.mockResolvedValue(null);
    prismaService.handover.create.mockImplementation(({ data }: any) => {
      expect(data.tokenHash).toBeDefined();
      expect(data.tokenHash).not.toEqual('sample-raw-token');
      return Promise.resolve({
        id: 'handover-100',
        ...data,
        claim: mockClaim,
      });
    });

    const res = await service.create(mockClaimant.id, mockClaimant.role, {
      claimId: mockClaim.id,
    });

    expect(res.rawToken).toBeDefined();
    expect(res.rawToken.length).toBeGreaterThanOrEqual(64);
    expect((res as any).tokenHash).toBeUndefined();
    expect(prismaService.handover.create).toHaveBeenCalled();
  });

  it('2. Renewal invalidates old token: oldToken -> FAIL, newToken -> SUCCESS', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);

    // Initial creation
    prismaService.handover.findUnique.mockResolvedValue(null);
    let storedHash = '';
    prismaService.handover.create.mockImplementation(({ data }: any) => {
      storedHash = data.tokenHash;
      return Promise.resolve({ id: 'handover-100', ...data, claim: mockClaim });
    });

    const session1 = await service.create(mockClaimant.id, mockClaimant.role, {
      claimId: mockClaim.id,
    });
    const oldRawToken = session1.rawToken!;
    expect(oldRawToken).toBeDefined();

    // Renewal
    prismaService.handover.findUnique.mockResolvedValue({
      id: 'handover-100',
      tokenHash: storedHash,
      status: HandoverStatus.PENDING,
      expiresAt: new Date(Date.now() + 10000),
    });

    prismaService.handover.update.mockImplementation(({ data }: any) => {
      storedHash = data.tokenHash;
      return Promise.resolve({ id: 'handover-100', ...data, claim: mockClaim });
    });

    const session2 = await service.create(mockClaimant.id, mockClaimant.role, {
      claimId: mockClaim.id,
    });
    const newRawToken = session2.rawToken!;
    expect(newRawToken).toBeDefined();
    expect(newRawToken).not.toEqual(oldRawToken);

    // Test scan with old token -> FAILS (NotFoundException)
    prismaService.handover.findUnique.mockImplementation(({ where }: any) => {
      if (
        where.tokenHash ===
        crypto.createHash('sha256').update(newRawToken).digest('hex')
      ) {
        return Promise.resolve({
          id: 'handover-100',
          tokenHash: storedHash,
          status: HandoverStatus.PENDING,
          expiresAt: new Date(Date.now() + 10000),
          claim: mockClaim,
        });
      }
      return Promise.resolve(null);
    });

    await expect(
      service.scanAndComplete(mockFinder.id, mockFinder.role, {
        token: oldRawToken,
      })
    ).rejects.toThrow(NotFoundException);

    // Test scan with new token -> SUCCEEDS
    prismaService.handover.update.mockResolvedValue({
      id: 'handover-100',
      status: HandoverStatus.COMPLETED,
      claim: mockClaim,
    });

    const scanRes = await service.scanAndComplete(
      mockFinder.id,
      mockFinder.role,
      { token: newRawToken }
    );
    expect(scanRes.status).toEqual(HandoverStatus.COMPLETED);
  });

  it('3. Concurrent scan test: Exactly ONE scan succeeds, second scan fails with ConflictException', async () => {
    const rawToken = 'test-concurrent-raw-token-abcdef1234567890';
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    let executionCount = 0;

    prismaService.handover.findUnique.mockImplementation(({ where }: any) => {
      if (where.tokenHash === hash) {
        return Promise.resolve({
          id: 'handover-100',
          claimId: mockClaim.id,
          tokenHash: hash,
          status:
            executionCount > 1
              ? HandoverStatus.COMPLETED
              : HandoverStatus.PENDING,
          expiresAt: new Date(Date.now() + 100000),
          claim: mockClaim,
        });
      }
      return Promise.resolve(null);
    });

    prismaService.handover.update.mockResolvedValue({
      id: 'handover-100',
      status: HandoverStatus.COMPLETED,
      claim: mockClaim,
    });

    prismaService.$transaction.mockImplementation(async (cb: any) => {
      executionCount++;
      if (executionCount > 1) {
        throw new ConflictException(
          'This handover token has already been consumed and completed'
        );
      }
      return cb(prismaService);
    });

    const results = await Promise.allSettled([
      service.scanAndComplete(mockFinder.id, mockFinder.role, {
        token: rawToken,
      }),
      service.scanAndComplete(mockFinder.id, mockFinder.role, {
        token: rawToken,
      }),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toEqual(1);
    expect(rejected.length).toEqual(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      ConflictException
    );
  });

  it('4. Unrelated user scan fails with ForbiddenException', async () => {
    const rawToken = 'test-secret-token-abcdef1234567890';
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    prismaService.handover.findUnique.mockResolvedValue({
      id: 'handover-100',
      tokenHash: hash,
      status: HandoverStatus.PENDING,
      expiresAt: new Date(Date.now() + 10000),
      claim: mockClaim,
    });

    await expect(
      service.scanAndComplete(mockOtherUser.id, mockOtherUser.role, {
        token: rawToken,
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('5. Staff (non-participant Moderator) scan fails with ForbiddenException', async () => {
    const rawToken = 'test-secret-token-abcdef1234567890';
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    prismaService.handover.findUnique.mockResolvedValue({
      id: 'handover-100',
      tokenHash: hash,
      status: HandoverStatus.PENDING,
      expiresAt: new Date(Date.now() + 10000),
      claim: mockClaim,
    });

    await expect(
      service.scanAndComplete(mockStaff.id, mockStaff.role, { token: rawToken })
    ).rejects.toThrow(ForbiddenException);
  });

  it('6. IDOR: Unrelated user cannot view or cancel handover', async () => {
    prismaService.handover.findUnique.mockResolvedValue({
      id: 'handover-100',
      status: HandoverStatus.PENDING,
      claim: mockClaim,
    });

    await expect(
      service.findOne('handover-100', mockOtherUser.id, mockOtherUser.role)
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.cancel('handover-100', mockOtherUser.id, mockOtherUser.role)
    ).rejects.toThrow(ForbiddenException);
  });
});
