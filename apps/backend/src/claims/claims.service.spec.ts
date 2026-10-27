import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  ClaimStatus,
  ItemCategory,
  ItemStatus,
  Role,
} from '@prisma/client';
import { CreateClaimDto } from './dto/create-claim.dto';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let prismaService: any;
  let notificationsService: any;
  let auditService: any;

  const mockUser = { id: 'user-claimant', role: Role.USER };
  const mockFinder = { id: 'user-finder', role: Role.USER };
  const mockOtherUser = { id: 'user-other', role: Role.USER };
  const mockModerator = { id: 'mod-1', role: Role.MODERATOR };

  const mockFoundItem = {
    id: 'item-123',
    title: 'Found Airpods',
    category: ItemCategory.EARBUDS,
    publicDescription: 'Found near library',
    foundLocation: 'Library',
    foundDate: new Date('2026-09-01'),
    status: ItemStatus.APPROVED,
    foundById: mockFinder.id,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  const mockClaim = {
    id: 'claim-123',
    foundItemId: mockFoundItem.id,
    claimantId: mockUser.id,
    evidence: 'My name is engraved on the case and serial number ends in 89X.',
    status: ClaimStatus.PENDING,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    foundItem: mockFoundItem,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaService = {
      foundItem: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      claim: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
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
        ClaimsService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. USER can submit claim for APPROVED item starting as PENDING', async () => {
    const dto: CreateClaimDto = {
      foundItemId: mockFoundItem.id,
      evidence:
        'My name is engraved on the case and serial number ends in 89X.',
    };

    prismaService.foundItem.findUnique.mockResolvedValue(mockFoundItem);
    prismaService.claim.findUnique.mockResolvedValue(null);
    prismaService.claim.create.mockResolvedValue(mockClaim);

    const res = await service.create(mockUser.id, dto);

    expect(res).toBeDefined();
    expect(res.status).toBe(ClaimStatus.PENDING);
    expect(prismaService.claim.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          foundItemId: mockFoundItem.id,
          claimantId: mockUser.id,
          status: ClaimStatus.PENDING,
        }),
      })
    );
  });

  it('2. Cannot claim an unapproved FoundItem', async () => {
    const dto: CreateClaimDto = {
      foundItemId: mockFoundItem.id,
      evidence: 'Valid evidence text longer than 10 characters',
    };

    prismaService.foundItem.findUnique.mockResolvedValue({
      ...mockFoundItem,
      status: ItemStatus.PENDING,
    });

    await expect(service.create(mockUser.id, dto)).rejects.toThrow(
      BadRequestException
    );
  });

  it('3. Finder cannot claim their own found item', async () => {
    const dto: CreateClaimDto = {
      foundItemId: mockFoundItem.id,
      evidence: 'Valid evidence text longer than 10 characters',
    };

    prismaService.foundItem.findUnique.mockResolvedValue(mockFoundItem);

    await expect(service.create(mockFinder.id, dto)).rejects.toThrow(
      BadRequestException
    );
  });

  it('4. Duplicate active claim by same user throws ConflictException', async () => {
    const dto: CreateClaimDto = {
      foundItemId: mockFoundItem.id,
      evidence: 'Valid evidence text longer than 10 characters',
    };

    prismaService.foundItem.findUnique.mockResolvedValue(mockFoundItem);
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);

    await expect(service.create(mockUser.id, dto)).rejects.toThrow(
      ConflictException
    );
  });

  it('5. USER can retrieve own claims', async () => {
    prismaService.claim.findMany.mockResolvedValue([mockClaim]);
    prismaService.claim.count.mockResolvedValue(1);

    const res = await service.findMyClaims(mockUser.id, {});
    expect(res.data).toHaveLength(1);
    expect(res.data[0].claimantId).toBe(mockUser.id);
  });

  it('6. USER cannot view another user claim (IDOR security check)', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);

    await expect(
      service.findOne('claim-123', mockOtherUser.id, mockOtherUser.role)
    ).rejects.toThrow(ForbiddenException);
  });

  it('7. MODERATOR can view any claim', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);

    const res = await service.findOne(
      'claim-123',
      mockModerator.id,
      mockModerator.role
    );
    expect(res.id).toBe('claim-123');
  });

  it('8. USER can cancel own PENDING claim', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);
    prismaService.claim.update.mockResolvedValue({
      ...mockClaim,
      status: ClaimStatus.CANCELLED,
    });

    const res = await service.cancel('claim-123', mockUser.id);
    expect(res.status).toBe(ClaimStatus.CANCELLED);
  });

  it('9. MODERATOR can approve claim (updates FoundItem to CLAIMED)', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);
    prismaService.claim.findFirst.mockResolvedValue(null);
    prismaService.foundItem.update.mockResolvedValue({});
    prismaService.claim.update.mockResolvedValue({
      ...mockClaim,
      status: ClaimStatus.APPROVED,
      reviewerId: mockModerator.id,
    });

    const res = await service.reviewClaim(
      'claim-123',
      mockModerator.id,
      mockModerator.role,
      { status: ClaimStatus.APPROVED }
    );

    expect(res.status).toBe(ClaimStatus.APPROVED);
    expect(prismaService.foundItem.update).toHaveBeenCalledWith({
      where: { id: mockFoundItem.id },
      data: { status: ItemStatus.CLAIMED },
    });
    expect(auditService.logAction).toHaveBeenCalledWith(
      AuditAction.CLAIM_APPROVED,
      'Claim',
      'claim-123',
      mockModerator.id,
      expect.any(Object)
    );
  });

  it('10. Rejecting claim requires reviewReason', async () => {
    prismaService.claim.findUnique.mockResolvedValue(mockClaim);

    await expect(
      service.reviewClaim('claim-123', mockModerator.id, mockModerator.role, {
        status: ClaimStatus.REJECTED,
        reviewReason: '',
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('11. Concurrency check: Cannot approve claim if item is no longer APPROVED', async () => {
    prismaService.claim.findUnique.mockResolvedValue({
      ...mockClaim,
      foundItem: { ...mockFoundItem, status: ItemStatus.CLAIMED },
    });

    await expect(
      service.reviewClaim('claim-123', mockModerator.id, mockModerator.role, {
        status: ClaimStatus.APPROVED,
      })
    ).rejects.toThrow(ConflictException);
  });
});
