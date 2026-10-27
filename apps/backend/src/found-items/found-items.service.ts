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
import { ReputationService } from '../reputation/reputation.service';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto';
import { QueryFoundItemsDto } from './dto/query-found-items.dto';
import { ModerateFoundItemDto } from './dto/moderate-found-item.dto';
import {
  AuditAction,
  ItemStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class FoundItemsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private reputationService: ReputationService
  ) {}

  // Safe public field selection object
  private readonly publicItemSelect: Prisma.FoundItemSelect = {
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

  private validatePublicImages(publicImages?: string[]) {
    if (!publicImages || publicImages.length === 0) return;
    if (publicImages.length > 5) {
      throw new BadRequestException('Maximum 5 public images allowed per item');
    }
    for (const url of publicImages) {
      if (
        typeof url !== 'string' ||
        (!url.startsWith('http://') &&
          !url.startsWith('https://') &&
          !url.match(/\.(jpg|jpeg|png|webp)$/i))
      ) {
        throw new BadRequestException('Invalid image URL format');
      }
    }
  }

  /**
   * Submit a new found item (Starts as PENDING)
   */
  async create(userId: string, dto: CreateFoundItemDto) {
    const {
      title,
      category,
      publicDescription,
      foundLocation,
      foundDate,
      publicImages,
      serialNumber,
      hiddenMarks,
      privateIdentifyingInfo,
      privateNotes,
    } = dto;

    this.validatePublicImages(publicImages);

    const hasVerificationInfo =
      serialNumber || hiddenMarks || privateIdentifyingInfo || privateNotes;

    const item = await this.prisma.$transaction(async tx => {
      const createdItem = await tx.foundItem.create({
        data: {
          title,
          category,
          publicDescription,
          foundLocation,
          foundDate: new Date(foundDate),
          status: ItemStatus.PENDING,
          publicImages: publicImages || [],
          foundById: userId,
        },
        select: this.publicItemSelect,
      });

      if (hasVerificationInfo) {
        await tx.foundItemVerification.create({
          data: {
            foundItemId: createdItem.id,
            serialNumber: serialNumber || null,
            hiddenMarks: hiddenMarks || null,
            privateIdentifyingInfo: privateIdentifyingInfo || null,
            privateNotes: privateNotes || null,
          },
        });
      }

      return createdItem;
    });

    // Notify finder that their submission was received
    await this.notificationsService.createNotification(
      userId,
      NotificationType.ITEM_SUBMITTED,
      'Item Submission Received',
      `Your report for '${item.title}' has been submitted and is currently pending moderator review.`,
      `/found-items/${item.id}`
    );

    return item;
  }

  /**
   * Get public inventory (Strictly APPROVED items only)
   */
  async findPublicItems(query: QueryFoundItemsDto) {
    const {
      search,
      category,
      foundLocation,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.FoundItemWhereInput = {
      status: ItemStatus.APPROVED,
    };

    if (category) {
      where.category = category;
    }

    const trimmedLocation = foundLocation?.trim();
    if (trimmedLocation) {
      where.foundLocation = {
        contains: trimmedLocation.slice(0, 100),
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      const parsedFrom = dateFrom ? new Date(dateFrom) : null;
      const parsedTo = dateTo ? new Date(dateTo) : null;

      if (parsedFrom && isNaN(parsedFrom.getTime())) {
        throw new BadRequestException('Invalid dateFrom format');
      }
      if (parsedTo && isNaN(parsedTo.getTime())) {
        throw new BadRequestException('Invalid dateTo format');
      }
      if (parsedFrom && parsedTo && parsedFrom > parsedTo) {
        throw new BadRequestException('dateFrom cannot be later than dateTo');
      }

      where.foundDate = {};
      if (parsedFrom) {
        where.foundDate.gte = parsedFrom;
      }
      if (parsedTo) {
        where.foundDate.lte = parsedTo;
      }
    }

    const trimmedSearch = search?.trim().slice(0, 100);
    if (trimmedSearch) {
      where.OR = [
        { title: { contains: trimmedSearch, mode: 'insensitive' } },
        { publicDescription: { contains: trimmedSearch, mode: 'insensitive' } },
        { foundLocation: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.FoundItemOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.foundItem.findMany({
        where,
        select: this.publicItemSelect,
        orderBy,
        skip,
        take: safeLimit,
      }),
      this.prisma.foundItem.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Get single public found item by ID
   */
  async findPublicItemById(id: string) {
    const item = await this.prisma.foundItem.findFirst({
      where: {
        id,
        status: ItemStatus.APPROVED,
      },
      select: this.publicItemSelect,
    });

    if (!item) {
      throw new NotFoundException(
        'Found item not found or is not publicly available'
      );
    }

    return item;
  }

  /**
   * Get authenticated user's own submitted items
   */
  async findMyItems(userId: string, query: QueryFoundItemsDto) {
    const { page = 1, limit = 10 } = query;
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

    const where: Prisma.FoundItemWhereInput = {
      foundById: userId,
    };

    const [data, total] = await Promise.all([
      this.prisma.foundItem.findMany({
        where,
        select: this.publicItemSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.foundItem.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Update user's own item (Resets to PENDING if modified)
   */
  async update(id: string, userId: string, dto: UpdateFoundItemDto) {
    const existing = await this.prisma.foundItem.findUnique({
      where: { id },
      include: { verification: true },
    });

    if (!existing) {
      throw new NotFoundException('Found item not found');
    }

    if (existing.foundById !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this item'
      );
    }

    const {
      title,
      category,
      publicDescription,
      foundLocation,
      foundDate,
      publicImages,
      serialNumber,
      hiddenMarks,
      privateIdentifyingInfo,
      privateNotes,
    } = dto;

    this.validatePublicImages(publicImages);

    // Reset status to PENDING if currently APPROVED/REJECTED for re-moderation
    const newStatus = ItemStatus.PENDING;

    return this.prisma.$transaction(async tx => {
      const updatedItem = await tx.foundItem.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(category && { category }),
          ...(publicDescription && { publicDescription }),
          ...(foundLocation && { foundLocation }),
          ...(foundDate && { foundDate: new Date(foundDate) }),
          ...(publicImages && { publicImages }),
          status: newStatus,
        },
        select: this.publicItemSelect,
      });

      const verificationData = {
        serialNumber:
          serialNumber !== undefined
            ? serialNumber
            : existing.verification?.serialNumber,
        hiddenMarks:
          hiddenMarks !== undefined
            ? hiddenMarks
            : existing.verification?.hiddenMarks,
        privateIdentifyingInfo:
          privateIdentifyingInfo !== undefined
            ? privateIdentifyingInfo
            : existing.verification?.privateIdentifyingInfo,
        privateNotes:
          privateNotes !== undefined
            ? privateNotes
            : existing.verification?.privateNotes,
      };

      if (existing.verification) {
        await tx.foundItemVerification.update({
          where: { foundItemId: id },
          data: verificationData,
        });
      } else if (
        verificationData.serialNumber ||
        verificationData.hiddenMarks ||
        verificationData.privateIdentifyingInfo ||
        verificationData.privateNotes
      ) {
        await tx.foundItemVerification.create({
          data: {
            foundItemId: id,
            ...verificationData,
          },
        });
      }

      return updatedItem;
    });
  }

  /**
   * Moderator: Get pending items queue
   */
  async findPendingItems(query: QueryFoundItemsDto) {
    const { page = 1, limit = 10 } = query;
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

    const where: Prisma.FoundItemWhereInput = {
      status: ItemStatus.PENDING,
    };

    const [data, total] = await Promise.all([
      this.prisma.foundItem.findMany({
        where,
        include: {
          verification: true,
          foundBy: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              rollNo: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.foundItem.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Moderator: Get single item details with verification info
   */
  async findModeratorItemById(id: string) {
    const item = await this.prisma.foundItem.findUnique({
      where: { id },
      include: {
        verification: true,
        foundBy: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            rollNo: true,
            department: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Found item not found');
    }

    return item;
  }

  /**
   * Moderator/Admin: Approve pending item (Atomic status transition)
   */
  async approve(id: string, moderatorId: string) {
    const updateResult = await this.prisma.foundItem.updateMany({
      where: {
        id,
        status: ItemStatus.PENDING,
      },
      data: {
        status: ItemStatus.APPROVED,
      },
    });

    if (updateResult.count === 0) {
      const item = await this.prisma.foundItem.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException('Found item not found');
      }
      throw new ConflictException(
        `Item cannot be approved because its current status is '${item.status}'`
      );
    }

    const item = await this.prisma.foundItem.findUnique({
      where: { id },
      select: this.publicItemSelect,
    });

    if (item) {
      // Audit logging
      await this.auditService.logAction(
        AuditAction.ITEM_APPROVED,
        'FoundItem',
        id,
        moderatorId,
        { title: item.title, status: ItemStatus.APPROVED }
      );

      // Notify finder
      await this.notificationsService.createNotification(
        item.foundById,
        NotificationType.ITEM_APPROVED,
        'Found Item Approved',
        `Your found item report for '${item.title}' has been approved and is now visible in the campus inventory.`,
        `/found-items/${item.id}`
      );

      // Award Trust Score points for approved found item submission (Idempotent)
      await this.reputationService.adjustTrustScore(
        item.foundById,
        20,
        'Found item report approved by moderation',
        'FoundItem',
        item.id
      );
    }

    return item;
  }

  /**
   * Moderator/Admin: Reject pending item (Atomic status transition)
   */
  async reject(id: string, moderatorId: string, dto: ModerateFoundItemDto) {
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new BadRequestException('A rejection reason is required');
    }

    const updateResult = await this.prisma.foundItem.updateMany({
      where: {
        id,
        status: ItemStatus.PENDING,
      },
      data: {
        status: ItemStatus.REJECTED,
      },
    });

    if (updateResult.count === 0) {
      const item = await this.prisma.foundItem.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException('Found item not found');
      }
      throw new ConflictException(
        `Item cannot be rejected because its current status is '${item.status}'`
      );
    }

    const item = await this.prisma.foundItem.findUnique({
      where: { id },
      select: this.publicItemSelect,
    });

    if (item) {
      // Audit logging
      await this.auditService.logAction(
        AuditAction.ITEM_REJECTED,
        'FoundItem',
        id,
        moderatorId,
        { title: item.title, reason: dto.reason, status: ItemStatus.REJECTED }
      );

      // Notify finder
      await this.notificationsService.createNotification(
        item.foundById,
        NotificationType.ITEM_REJECTED,
        'Found Item Submission Rejected',
        `Your found item report for '${item.title}' was rejected by moderation. Reason: ${dto.reason}`,
        `/found-items/my`
      );
    }

    return item;
  }

  /**
   * Moderator/Admin: Get moderation stats summary
   */
  async getModerationStats() {
    const [
      pendingItemsCount,
      pendingClaimsCount,
      totalApprovedItemsCount,
      totalClaimedItemsCount,
    ] = await Promise.all([
      this.prisma.foundItem.count({ where: { status: ItemStatus.PENDING } }),
      this.prisma.claim.count({ where: { status: 'PENDING' as any } }),
      this.prisma.foundItem.count({ where: { status: ItemStatus.APPROVED } }),
      this.prisma.foundItem.count({ where: { status: ItemStatus.CLAIMED } }),
    ]);

    return {
      pendingItemsCount,
      pendingClaimsCount,
      totalApprovedItemsCount,
      totalClaimedItemsCount,
    };
  }
}
