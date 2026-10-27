import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ReputationService } from '../reputation/reputation.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { ScanHandoverDto } from './dto/scan-handover.dto';
import {
  AuditAction,
  ClaimStatus,
  HandoverStatus,
  ItemStatus,
  NotificationType,
  Role,
} from '@prisma/client';

@Injectable()
export class HandoversService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private reputationService: ReputationService
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

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  private generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create or regenerate a secure handover session for an APPROVED claim
   */
  async create(userId: string, userRole: Role, dto: CreateHandoverDto) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: dto.claimId },
      include: {
        foundItem: true,
        claimant: { select: this.safeUserSelect },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID "${dto.claimId}" not found`);
    }

    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException(
        `Handover can only be created for an APPROVED claim (current claim status: ${claim.status})`
      );
    }

    if (claim.foundItem.status !== ItemStatus.CLAIMED) {
      throw new BadRequestException(
        `Handover can only be created for a CLAIMED found item (current item status: ${claim.foundItem.status})`
      );
    }

    // Participant Security Check: User must be claimant, finder, or staff
    const isClaimant = claim.claimantId === userId;
    const isFinder = claim.foundItem.foundById === userId;
    const isStaff = userRole === Role.MODERATOR || userRole === Role.ADMIN;

    if (!isClaimant && !isFinder && !isStaff) {
      throw new ForbiddenException(
        'You are not an authorized participant for this claim'
      );
    }

    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    const existingHandover = await this.prisma.handover.findUnique({
      where: { claimId: dto.claimId },
    });

    let handover;

    if (existingHandover) {
      if (existingHandover.status === HandoverStatus.COMPLETED) {
        throw new ConflictException(
          'Handover for this claim has already been completed'
        );
      }

      // Update existing handover with new one-time token and fresh 24h expiry
      handover = await this.prisma.handover.update({
        where: { id: existingHandover.id },
        data: {
          tokenHash,
          expiresAt,
          status: HandoverStatus.PENDING,
          scannedAt: null,
          cancelledAt: null,
        },
        include: {
          claim: {
            include: {
              foundItem: { select: this.publicFoundItemSelect },
              claimant: { select: this.safeUserSelect },
            },
          },
        },
      });
    } else {
      handover = await this.prisma.handover.create({
        data: {
          claimId: dto.claimId,
          tokenHash,
          expiresAt,
          status: HandoverStatus.PENDING,
        },
        include: {
          claim: {
            include: {
              foundItem: { select: this.publicFoundItemSelect },
              claimant: { select: this.safeUserSelect },
            },
          },
        },
      });

      // Send notifications
      await this.notificationsService.createNotification(
        claim.claimantId,
        NotificationType.HANDOVER_CREATED,
        'Handover QR Ready',
        `Your handover authorization for "${claim.foundItem.title}" is ready. Show your QR code to the finder or campus staff to complete handover.`,
        `/handovers/${handover.id}`
      );
    }

    // Strip tokenHash from response object and include rawToken exclusively for this caller
    const safeHandover = { ...handover };
    delete (safeHandover as any).tokenHash;
    return {
      ...safeHandover,
      rawToken,
    };
  }

  /**
   * Get user's active/past handovers
   */
  async findMyHandovers(userId: string) {
    const handovers = await this.prisma.handover.findMany({
      where: {
        claim: {
          OR: [{ claimantId: userId }, { foundItem: { foundById: userId } }],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        claim: {
          include: {
            foundItem: { select: this.publicFoundItemSelect },
            claimant: { select: this.safeUserSelect },
          },
        },
      },
    });

    // Strip tokenHash from response array
    return handovers.map(item => {
      const safe = { ...item };
      delete (safe as any).tokenHash;
      return safe;
    });
  }

  /**
   * Get single handover by ID (Participant or staff only)
   */
  async findOne(id: string, userId: string, userRole: Role) {
    const handover = await this.prisma.handover.findUnique({
      where: { id },
      include: {
        claim: {
          include: {
            foundItem: { select: this.publicFoundItemSelect },
            claimant: { select: this.safeUserSelect },
          },
        },
      },
    });

    if (!handover) {
      throw new NotFoundException(`Handover with ID "${id}" not found`);
    }

    const isClaimant = handover.claim.claimantId === userId;
    const isFinder = handover.claim.foundItem.foundById === userId;
    const isStaff = userRole === Role.MODERATOR || userRole === Role.ADMIN;

    if (!isClaimant && !isFinder && !isStaff) {
      throw new ForbiddenException(
        'You do not have permission to view this handover'
      );
    }

    const safe = { ...handover };
    delete (safe as any).tokenHash;
    return safe;
  }

  /**
   * Scan token and complete handover atomically
   */
  async scanAndComplete(
    scannerId: string,
    scannerRole: Role,
    dto: ScanHandoverDto
  ) {
    const tokenHash = this.hashToken(dto.token);

    return this.prisma.$transaction(async tx => {
      const handover = await tx.handover.findUnique({
        where: { tokenHash },
        include: {
          claim: {
            include: {
              foundItem: true,
              claimant: { select: this.safeUserSelect },
            },
          },
        },
      });

      if (!handover) {
        throw new NotFoundException('Invalid or unknown handover token');
      }

      if (handover.status === HandoverStatus.COMPLETED) {
        throw new ConflictException(
          'This handover token has already been consumed and completed'
        );
      }

      if (handover.status === HandoverStatus.CANCELLED) {
        throw new BadRequestException('This handover token has been cancelled');
      }

      if (
        handover.status === HandoverStatus.EXPIRED ||
        new Date() > handover.expiresAt
      ) {
        if (handover.status !== HandoverStatus.EXPIRED) {
          await tx.handover.update({
            where: { id: handover.id },
            data: { status: HandoverStatus.EXPIRED },
          });
        }
        throw new BadRequestException(
          'This handover token has expired. Please generate a new handover QR.'
        );
      }

      // Participant Security Check: Strict participant check (claimant or finder ONLY)
      const isClaimant = handover.claim.claimantId === scannerId;
      const isFinder = handover.claim.foundItem.foundById === scannerId;

      if (!isClaimant && !isFinder) {
        throw new ForbiddenException(
          'Only an authorized participant (the verified claimant or finder) can complete this handover scan'
        );
      }

      const now = new Date();

      // 1. Mark Handover as COMPLETED
      const completedHandover = await tx.handover.update({
        where: { id: handover.id },
        data: {
          status: HandoverStatus.COMPLETED,
          scannedAt: now,
          completedAt: now,
        },
        include: {
          claim: {
            include: {
              foundItem: { select: this.publicFoundItemSelect },
              claimant: { select: this.safeUserSelect },
            },
          },
        },
      });

      // 2. Mark Claim as COMPLETED
      await tx.claim.update({
        where: { id: handover.claimId },
        data: {
          status: ClaimStatus.COMPLETED,
          completedAt: now,
        },
      });

      // 3. Mark FoundItem as RETURNED
      await tx.foundItem.update({
        where: { id: handover.claim.foundItemId },
        data: {
          status: ItemStatus.RETURNED,
        },
      });

      // 4. Audit Log
      await this.auditService.logAction(
        AuditAction.HANDOVER_COMPLETED,
        'Handover',
        handover.id,
        scannerId,
        {
          claimId: handover.claimId,
          foundItemId: handover.claim.foundItemId,
          claimantId: handover.claim.claimantId,
        }
      );

      // 5. Notifications
      await this.notificationsService.createNotification(
        handover.claim.claimantId,
        NotificationType.HANDOVER_COMPLETED,
        'Item Handover Confirmed!',
        `Physical handover of "${handover.claim.foundItem.title}" is confirmed. Item status updated to RETURNED.`,
        `/handovers/${handover.id}`
      );

      await this.notificationsService.createNotification(
        handover.claim.foundItem.foundById,
        NotificationType.ITEM_RETURNED,
        'Found Item Return Complete',
        `Physical handover for "${handover.claim.foundItem.title}" has been confirmed by campus workflow.`,
        `/handovers/${handover.id}`
      );

      // 6. Award Trust Score points (Idempotent)
      // Finder: +30 points for completing item return
      await this.reputationService.adjustTrustScore(
        handover.claim.foundItem.foundById,
        30,
        'Item returned via physical handover',
        'HandoverFinder',
        handover.id
      );

      // Claimant: +10 points for verified physical handover
      await this.reputationService.adjustTrustScore(
        handover.claim.claimantId,
        10,
        'Successful item handover verification',
        'HandoverClaimant',
        handover.id
      );

      const safe = { ...completedHandover };
      delete (safe as any).tokenHash;
      return safe;
    });
  }

  /**
   * Cancel PENDING handover
   */
  async cancel(id: string, userId: string, userRole: Role) {
    const handover = await this.prisma.handover.findUnique({
      where: { id },
      include: { claim: { include: { foundItem: true } } },
    });

    if (!handover) {
      throw new NotFoundException(`Handover with ID "${id}" not found`);
    }

    const isClaimant = handover.claim.claimantId === userId;
    const isFinder = handover.claim.foundItem.foundById === userId;
    const isStaff = userRole === Role.MODERATOR || userRole === Role.ADMIN;

    if (!isClaimant && !isFinder && !isStaff) {
      throw new ForbiddenException(
        'You do not have permission to cancel this handover'
      );
    }

    if (handover.status !== HandoverStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING handovers can be cancelled (current status: ${handover.status})`
      );
    }

    const cancelled = await this.prisma.handover.update({
      where: { id },
      data: {
        status: HandoverStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        claim: {
          include: {
            foundItem: { select: this.publicFoundItemSelect },
            claimant: { select: this.safeUserSelect },
          },
        },
      },
    });

    const safe = { ...cancelled };
    delete (safe as any).tokenHash;
    return safe;
  }
}
