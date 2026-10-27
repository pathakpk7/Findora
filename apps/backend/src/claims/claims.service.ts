import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { QueryClaimsDto } from './dto/query-claims.dto';
import {
  AuditAction,
  ClaimStatus,
  ItemStatus,
  NotificationType,
  Prisma,
  Role,
} from '@prisma/client';

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService
  ) {}

  private readonly publicFoundItemSelect = {
    id: true,
    title: true,
    category: true,
    publicDescription: true,
    foundLocation: true,
    foundDate: true,
    status: true,
    publicImages: true,
    foundById: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly safeUserSelect = {
    id: true,
    username: true,
    email: true,
    firstName: true,
    lastName: true,
    avatar: true,
    rollNo: true,
    department: true,
  };

  /**
   * Submit a new claim for an approved FoundItem
   */
  async create(claimantId: string, dto: CreateClaimDto) {
    const item = await this.prisma.foundItem.findUnique({
      where: { id: dto.foundItemId },
    });

    if (!item) {
      throw new NotFoundException(
        `Found Item with ID "${dto.foundItemId}" not found`
      );
    }

    if (item.status !== ItemStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED found items can be claimed');
    }

    if (item.foundById === claimantId) {
      throw new BadRequestException(
        'You cannot claim an item that you reported as found'
      );
    }

    // Check for existing claim by this claimant on this item
    const existingClaim = await this.prisma.claim.findUnique({
      where: {
        foundItemId_claimantId: {
          foundItemId: dto.foundItemId,
          claimantId,
        },
      },
    });

    if (existingClaim) {
      if (
        existingClaim.status === ClaimStatus.PENDING ||
        existingClaim.status === ClaimStatus.APPROVED
      ) {
        throw new ConflictException(
          'You already have an active claim for this item'
        );
      }

      // Resubmit previously REJECTED or CANCELLED claim
      const resubmitted = await this.prisma.claim.update({
        where: { id: existingClaim.id },
        data: {
          evidence: dto.evidence.trim(),
          status: ClaimStatus.PENDING,
          reviewerId: null,
          reviewReason: null,
          reviewedAt: null,
        },
        include: {
          foundItem: { select: this.publicFoundItemSelect },
        },
      });

      await this.notificationsService.createNotification(
        claimantId,
        NotificationType.CLAIM_SUBMITTED,
        'Claim Resubmitted',
        `Your claim for "${item.title}" has been resubmitted and is awaiting moderator review.`,
        `/claims/${resubmitted.id}`
      );

      return resubmitted;
    }

    const claim = await this.prisma.claim.create({
      data: {
        foundItemId: dto.foundItemId,
        claimantId,
        evidence: dto.evidence.trim(),
        status: ClaimStatus.PENDING,
      },
      include: {
        foundItem: { select: this.publicFoundItemSelect },
      },
    });

    await this.notificationsService.createNotification(
      claimantId,
      NotificationType.CLAIM_SUBMITTED,
      'Claim Received',
      `Your claim for "${item.title}" has been submitted successfully and is pending review.`,
      `/claims/${claim.id}`
    );

    return claim;
  }

  /**
   * Get authenticated user's own claims (Paginated, filtered, sorted)
   */
  async findMyClaims(claimantId: string, query: QueryClaimsDto) {
    const {
      status,
      foundItemId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ClaimWhereInput = {
      claimantId,
    };

    if (status) {
      where.status = status;
    }

    if (foundItemId) {
      where.foundItemId = foundItemId;
    }

    const orderBy: Prisma.ClaimOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          foundItem: { select: this.publicFoundItemSelect },
        },
      }),
      this.prisma.claim.count({ where }),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Get single claim by ID (Claimant or Moderator/Admin only)
   */
  async findOne(id: string, requesterId: string, requesterRole: Role) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        foundItem: { select: this.publicFoundItemSelect },
        claimant: { select: this.safeUserSelect },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID "${id}" not found`);
    }

    // IDOR Security Check
    if (
      claim.claimantId !== requesterId &&
      requesterRole !== Role.MODERATOR &&
      requesterRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this claim'
      );
    }

    return claim;
  }

  /**
   * Update evidence for own PENDING claim
   */
  async updateEvidence(id: string, claimantId: string, dto: UpdateClaimDto) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID "${id}" not found`);
    }

    if (claim.claimantId !== claimantId) {
      throw new ForbiddenException(
        'You do not have permission to update this claim'
      );
    }

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException('Only PENDING claims can be updated');
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        evidence: dto.evidence.trim(),
      },
      include: {
        foundItem: { select: this.publicFoundItemSelect },
      },
    });
  }

  /**
   * Cancel own PENDING claim
   */
  async cancel(id: string, claimantId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID "${id}" not found`);
    }

    if (claim.claimantId !== claimantId) {
      throw new ForbiddenException(
        'You do not have permission to cancel this claim'
      );
    }

    if (
      claim.status !== ClaimStatus.PENDING &&
      claim.status !== ClaimStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Only PENDING or UNDER_REVIEW claims can be cancelled'
      );
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        status: ClaimStatus.CANCELLED,
      },
      include: {
        foundItem: { select: this.publicFoundItemSelect },
      },
    });
  }

  /**
   * Moderator: Get pending claims for review (Includes private verification data!)
   */
  async findPendingModeration(query: QueryClaimsDto) {
    const {
      status = ClaimStatus.PENDING,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'asc',
    } = query;

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ClaimWhereInput = {
      status,
    };

    const orderBy: Prisma.ClaimOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          foundItem: {
            include: {
              verification: true, // Verification included exclusively for moderators
              foundBy: { select: this.safeUserSelect },
            },
          },
          claimant: { select: this.safeUserSelect },
        },
      }),
      this.prisma.claim.count({ where }),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Moderator: Get single claim detail for review modal (Includes verification)
   */
  async findModerationDetail(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        foundItem: {
          include: {
            verification: true,
            foundBy: { select: this.safeUserSelect },
          },
        },
        claimant: { select: this.safeUserSelect },
        reviewer: { select: this.safeUserSelect },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID "${id}" not found`);
    }

    return claim;
  }

  /**
   * Moderator: Review claim (APPROVE or REJECT) with atomic concurrency control
   */
  async reviewClaim(
    id: string,
    reviewerId: string,
    reviewerRole: Role,
    dto: ReviewClaimDto
  ) {
    if (
      dto.status !== ClaimStatus.APPROVED &&
      dto.status !== ClaimStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Review status must be APPROVED or REJECTED'
      );
    }

    if (dto.status === ClaimStatus.REJECTED && !dto.reviewReason?.trim()) {
      throw new BadRequestException(
        'Review reason is required when rejecting a claim'
      );
    }

    return this.prisma.$transaction(async tx => {
      const claim = await tx.claim.findUnique({
        where: { id },
        include: { foundItem: true },
      });

      if (!claim) {
        throw new NotFoundException(`Claim with ID "${id}" not found`);
      }

      if (
        claim.status === ClaimStatus.APPROVED ||
        claim.status === ClaimStatus.REJECTED ||
        claim.status === ClaimStatus.CANCELLED
      ) {
        throw new ConflictException(
          `Claim has already been processed with status ${claim.status}`
        );
      }

      if (dto.status === ClaimStatus.APPROVED) {
        // Concurrency Check: Ensure FoundItem is still APPROVED and not already claimed
        if (claim.foundItem.status !== ItemStatus.APPROVED) {
          throw new ConflictException(
            `Cannot approve claim: Found Item is in status ${claim.foundItem.status}`
          );
        }

        // Concurrency Check: Ensure no other claim for this foundItem was approved
        const existingApproved = await tx.claim.findFirst({
          where: {
            foundItemId: claim.foundItemId,
            status: ClaimStatus.APPROVED,
          },
        });

        if (existingApproved) {
          throw new ConflictException(
            'Another claim has already been approved for this item'
          );
        }

        // Update FoundItem status to CLAIMED
        await tx.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: ItemStatus.CLAIMED },
        });

        // Approve target claim
        const approvedClaim = await tx.claim.update({
          where: { id },
          data: {
            status: ClaimStatus.APPROVED,
            reviewerId,
            reviewReason: dto.reviewReason?.trim(),
            reviewedAt: new Date(),
          },
        });

        // Reject any other pending claims for this item
        await tx.claim.updateMany({
          where: {
            foundItemId: claim.foundItemId,
            id: { not: id },
            status: { in: [ClaimStatus.PENDING, ClaimStatus.UNDER_REVIEW] },
          },
          data: {
            status: ClaimStatus.REJECTED,
            reviewerId,
            reviewReason: 'Another claim was approved for this item',
            reviewedAt: new Date(),
          },
        });

        // Send Notification to claimant
        await this.notificationsService.createNotification(
          claim.claimantId,
          NotificationType.CLAIM_APPROVED,
          'Claim Approved!',
          `Your claim for "${claim.foundItem.title}" has been approved! Campus moderators will contact you for handover.`,
          `/claims/${id}`
        );

        // Audit Log
        await this.auditService.logAction(
          AuditAction.CLAIM_APPROVED,
          'Claim',
          id,
          reviewerId,
          { foundItemId: claim.foundItemId, claimantId: claim.claimantId }
        );

        return approvedClaim;
      } else {
        // REJECT
        const rejectedClaim = await tx.claim.update({
          where: { id },
          data: {
            status: ClaimStatus.REJECTED,
            reviewerId,
            reviewReason: dto.reviewReason?.trim(),
            reviewedAt: new Date(),
          },
        });

        // Send Notification to claimant
        await this.notificationsService.createNotification(
          claim.claimantId,
          NotificationType.CLAIM_REJECTED,
          'Claim Update',
          `Your claim for "${claim.foundItem.title}" was not approved. Reason: ${dto.reviewReason?.trim()}`,
          `/claims/${id}`
        );

        // Audit Log
        await this.auditService.logAction(
          AuditAction.CLAIM_REJECTED,
          'Claim',
          id,
          reviewerId,
          { foundItemId: claim.foundItemId, reason: dto.reviewReason?.trim() }
        );

        return rejectedClaim;
      }
    });
  }
}
