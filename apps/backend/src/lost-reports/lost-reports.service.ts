import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import { UpdateLostReportDto } from './dto/update-lost-report.dto';
import { QueryLostReportsDto } from './dto/query-lost-reports.dto';
import {
  LostReportStatus,
  NotificationType,
  Prisma,
  Role,
} from '@prisma/client';

@Injectable()
export class LostReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  private validateImages(images?: string[]) {
    if (!images || images.length === 0) return;
    if (images.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed per lost report');
    }
    for (const url of images) {
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
   * Create a new Lost Report (Always starts as ACTIVE)
   */
  async create(reporterId: string, dto: CreateLostReportDto) {
    const parsedDate = new Date(dto.lostDate);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid lostDate format');
    }

    this.validateImages(dto.images);

    const report = await this.prisma.lostReport.create({
      data: {
        reporterId,
        title: dto.title.trim(),
        category: dto.category,
        description: dto.description.trim(),
        lostLocation: dto.lostLocation.trim(),
        lostDate: parsedDate,
        identifyingCharacteristics: dto.identifyingCharacteristics?.trim(),
        images: dto.images || [],
        status: LostReportStatus.ACTIVE,
      },
    });

    // Confirmation notification to reporter
    await this.notificationsService.createNotification(
      reporterId,
      NotificationType.SYSTEM,
      'Lost Report Created',
      `Your lost report "${report.title}" has been registered successfully.`,
      `/lost-reports/${report.id}`
    );

    return report;
  }

  /**
   * Get user's own lost reports (Paginated, filtered, sorted)
   */
  async findMyReports(reporterId: string, query: QueryLostReportsDto) {
    const {
      category,
      status,
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

    const where: Prisma.LostReportWhereInput = {
      reporterId,
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
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

      where.lostDate = {};
      if (parsedFrom) {
        where.lostDate.gte = parsedFrom;
      }
      if (parsedTo) {
        where.lostDate.lte = parsedTo;
      }
    }

    const orderBy: Prisma.LostReportOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.lostReport.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
      }),
      this.prisma.lostReport.count({ where }),
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
   * Get single Lost Report by ID (Owner or Moderator/Admin only)
   */
  async findOne(id: string, requesterId: string, requesterRole: Role) {
    const report = await this.prisma.lostReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Lost Report with ID "${id}" not found`);
    }

    // IDOR Security check
    if (
      report.reporterId !== requesterId &&
      requesterRole !== Role.MODERATOR &&
      requesterRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this lost report'
      );
    }

    return report;
  }

  /**
   * Update own Lost Report (Owner only, report must be ACTIVE)
   */
  async update(id: string, requesterId: string, dto: UpdateLostReportDto) {
    const report = await this.prisma.lostReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Lost Report with ID "${id}" not found`);
    }

    if (report.reporterId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to update this lost report'
      );
    }

    if (report.status !== LostReportStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE lost reports can be updated');
    }

    if (dto.images) {
      this.validateImages(dto.images);
    }

    const updateData: Prisma.LostReportUpdateInput = {};

    if (dto.title) updateData.title = dto.title.trim();
    if (dto.category) updateData.category = dto.category;
    if (dto.description) updateData.description = dto.description.trim();
    if (dto.lostLocation) updateData.lostLocation = dto.lostLocation.trim();
    if (dto.lostDate) {
      const parsedDate = new Date(dto.lostDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid lostDate format');
      }
      updateData.lostDate = parsedDate;
    }
    if (dto.identifyingCharacteristics !== undefined) {
      updateData.identifyingCharacteristics =
        dto.identifyingCharacteristics?.trim();
    }
    if (dto.images) updateData.images = dto.images;

    return this.prisma.lostReport.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Update status of Lost Report (Cancel/Close by Owner, or Moderator override)
   */
  async updateStatus(
    id: string,
    requesterId: string,
    requesterRole: Role,
    status: LostReportStatus
  ) {
    const report = await this.prisma.lostReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Lost Report with ID "${id}" not found`);
    }

    const isOwner = report.reporterId === requesterId;
    const isStaff =
      requesterRole === Role.MODERATOR || requesterRole === Role.ADMIN;

    if (!isOwner && !isStaff) {
      throw new ForbiddenException(
        'You do not have permission to update this lost report status'
      );
    }

    // Standard users can only set CANCELLED or CLOSED
    if (
      !isStaff &&
      status !== LostReportStatus.CANCELLED &&
      status !== LostReportStatus.CLOSED
    ) {
      throw new ForbiddenException(
        'Users can only CANCEL or CLOSE their own lost report'
      );
    }

    if (
      report.status === LostReportStatus.CANCELLED ||
      report.status === LostReportStatus.CLOSED ||
      report.status === LostReportStatus.RECOVERED
    ) {
      throw new BadRequestException(
        'Cannot change status of a finished lost report'
      );
    }

    return this.prisma.lostReport.update({
      where: { id },
      data: { status },
    });
  }
}
