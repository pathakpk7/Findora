import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  ClaimStatus,
  HandoverStatus,
  ItemStatus,
  LostReportStatus,
  Role,
} from '@prisma/client';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  private parseDateRange(from?: string, to?: string) {
    const endDate = to ? new Date(to) : new Date();
    if (isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid "to" date format');
    }

    const startDate = from
      ? new Date(from)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid "from" date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('"from" date cannot be after "to" date');
    }

    return { startDate, endDate };
  }

  /**
   * Platform-wide Overview Analytics
   */
  async getOverviewAnalytics(dto: QueryAnalyticsDto) {
    const { startDate, endDate } = this.parseDateRange(dto.from, dto.to);

    const [
      totalUsers,
      verifiedUsers,
      activeUsers,
      usersByRoleRaw,
      newUsersInPeriod,
      totalFoundItems,
      foundByStatusRaw,
      newFoundInPeriod,
      totalLostReports,
      lostByStatusRaw,
      newLostInPeriod,
      totalClaims,
      claimsByStatusRaw,
      newClaimsInPeriod,
      totalHandovers,
      handoversByStatusRaw,
      newHandoversInPeriod,
      avgTrustScoreRaw,
      maxTrustScoreRaw,
      badgesAwardedCount,
      usersByLevelRaw,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.foundItem.count(),
      this.prisma.foundItem.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.foundItem.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.lostReport.count(),
      this.prisma.lostReport.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.lostReport.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.claim.count(),
      this.prisma.claim.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.claim.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.handover.count(),
      this.prisma.handover.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.handover.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.aggregate({
        _avg: { trustScore: true },
      }),
      this.prisma.user.aggregate({
        _max: { trustScore: true },
      }),
      this.prisma.userBadge.count(),
      this.prisma.user.findMany({ select: { trustScore: true } }),
    ]);

    const usersByRole = usersByRoleRaw.reduce(
      (acc, curr) => {
        acc[curr.role] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const foundByStatus = foundByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const lostByStatus = lostByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const claimsByStatus = claimsByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const handoversByStatus = handoversByStatusRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const usersByLevel: Record<string, number> = {
      'Level 1 (Novice)': 0,
      'Level 2 (Contributor)': 0,
      'Level 3 (Trusted Finder)': 0,
      'Level 4 (Campus Guardian)': 0,
      'Level 5 (Findora Hero)': 0,
    };

    usersByLevelRaw.forEach(u => {
      const score = u.trustScore;
      if (score >= 500) usersByLevel['Level 5 (Findora Hero)']++;
      else if (score >= 300) usersByLevel['Level 4 (Campus Guardian)']++;
      else if (score >= 150) usersByLevel['Level 3 (Trusted Finder)']++;
      else if (score >= 50) usersByLevel['Level 2 (Contributor)']++;
      else usersByLevel['Level 1 (Novice)']++;
    });

    return {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        active: activeUsers,
        byRole: usersByRole,
        newInPeriod: newUsersInPeriod,
      },
      foundItems: {
        total: totalFoundItems,
        pending: foundByStatus[ItemStatus.PENDING] || 0,
        approved: foundByStatus[ItemStatus.APPROVED] || 0,
        rejected: foundByStatus[ItemStatus.REJECTED] || 0,
        claimed: foundByStatus[ItemStatus.CLAIMED] || 0,
        returned: foundByStatus[ItemStatus.RETURNED] || 0,
        newInPeriod: newFoundInPeriod,
      },
      lostReports: {
        total: totalLostReports,
        active: lostByStatus[LostReportStatus.ACTIVE] || 0,
        matched: lostByStatus[LostReportStatus.MATCHED] || 0,
        recovered: lostByStatus[LostReportStatus.RECOVERED] || 0,
        closed: lostByStatus[LostReportStatus.CLOSED] || 0,
        cancelled: lostByStatus[LostReportStatus.CANCELLED] || 0,
        newInPeriod: newLostInPeriod,
      },
      claims: {
        total: totalClaims,
        pending: claimsByStatus[ClaimStatus.PENDING] || 0,
        underReview: claimsByStatus[ClaimStatus.UNDER_REVIEW] || 0,
        approved: claimsByStatus[ClaimStatus.APPROVED] || 0,
        rejected: claimsByStatus[ClaimStatus.REJECTED] || 0,
        completed: claimsByStatus[ClaimStatus.COMPLETED] || 0,
        newInPeriod: newClaimsInPeriod,
      },
      handovers: {
        total: totalHandovers,
        pending: handoversByStatus[HandoverStatus.PENDING] || 0,
        scanned: handoversByStatus[HandoverStatus.SCANNED] || 0,
        completed: handoversByStatus[HandoverStatus.COMPLETED] || 0,
        expired: handoversByStatus[HandoverStatus.EXPIRED] || 0,
        cancelled: handoversByStatus[HandoverStatus.CANCELLED] || 0,
        newInPeriod: newHandoversInPeriod,
      },
      reputation: {
        avgTrustScore: Math.round(avgTrustScoreRaw._avg.trustScore || 0),
        maxTrustScore: maxTrustScoreRaw._max.trustScore || 0,
        badgesAwardedCount,
        usersByLevel,
      },
    };
  }

  /**
   * Time-Series Trends Analytics
   */
  async getTrendAnalytics(dto: QueryAnalyticsDto) {
    const { startDate, endDate } = this.parseDateRange(dto.from, dto.to);

    const [foundItems, lostReports, claims, handovers, newUsers] =
      await Promise.all([
        this.prisma.foundItem.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true },
        }),
        this.prisma.lostReport.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true },
        }),
        this.prisma.claim.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true },
        }),
        this.prisma.handover.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true },
        }),
        this.prisma.user.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { createdAt: true },
        }),
      ]);

    const buckets = new Map<string, any>();

    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dateKey = curr.toISOString().split('T')[0];
      buckets.set(dateKey, {
        date: dateKey,
        foundItems: 0,
        lostReports: 0,
        claims: 0,
        handovers: 0,
        newUsers: 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    const formatKey = (d: Date) => d.toISOString().split('T')[0];

    foundItems.forEach(i => {
      const k = formatKey(i.createdAt);
      if (buckets.has(k)) buckets.get(k).foundItems++;
    });

    lostReports.forEach(r => {
      const k = formatKey(r.createdAt);
      if (buckets.has(k)) buckets.get(k).lostReports++;
    });

    claims.forEach(c => {
      const k = formatKey(c.createdAt);
      if (buckets.has(k)) buckets.get(k).claims++;
    });

    handovers.forEach(h => {
      const k = formatKey(h.createdAt);
      if (buckets.has(k)) buckets.get(k).handovers++;
    });

    newUsers.forEach(u => {
      const k = formatKey(u.createdAt);
      if (buckets.has(k)) buckets.get(k).newUsers++;
    });

    return Array.from(buckets.values());
  }

  /**
   * User Demographic & Role Analytics
   */
  async getUserAnalytics() {
    const [byRole, byDepartment, byYear, byVerification] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.user.groupBy({ by: ['department'], _count: true }),
      this.prisma.user.groupBy({ by: ['year'], _count: true }),
      this.prisma.user.groupBy({ by: ['isVerified'], _count: true }),
    ]);

    return {
      byRole: byRole.reduce(
        (acc, curr) => ({ ...acc, [curr.role]: curr._count }),
        {}
      ),
      byDepartment: byDepartment.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.department || 'Unspecified']: curr._count,
        }),
        {}
      ),
      byYear: byYear.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.year ? `Year ${curr.year}` : 'Unspecified']: curr._count,
        }),
        {}
      ),
      byVerification: byVerification.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.isVerified ? 'Verified' : 'Unverified']: curr._count,
        }),
        {}
      ),
    };
  }

  /**
   * Items & Category Analytics
   */
  async getItemAnalytics() {
    const [byCategory, byStatus, totalFound, approvedCount, rejectedCount] =
      await Promise.all([
        this.prisma.foundItem.groupBy({ by: ['category'], _count: true }),
        this.prisma.foundItem.groupBy({ by: ['status'], _count: true }),
        this.prisma.foundItem.count(),
        this.prisma.foundItem.count({
          where: { status: { in: [ItemStatus.APPROVED, ItemStatus.RETURNED] } },
        }),
        this.prisma.foundItem.count({
          where: { status: ItemStatus.REJECTED },
        }),
      ]);

    const totalEvaluated = approvedCount + rejectedCount;

    return {
      byCategory: byCategory.reduce(
        (acc, curr) => ({ ...acc, [curr.category]: curr._count }),
        {}
      ),
      byStatus: byStatus.reduce(
        (acc, curr) => ({ ...acc, [curr.status]: curr._count }),
        {}
      ),
      approvalRate:
        totalEvaluated > 0
          ? Math.round((approvedCount / totalEvaluated) * 100)
          : 0,
      rejectionRate:
        totalEvaluated > 0
          ? Math.round((rejectedCount / totalEvaluated) * 100)
          : 0,
      totalFound,
    };
  }

  /**
   * Claims & Handovers Analytics
   */
  async getClaimAnalytics() {
    const [
      totalClaims,
      approvedClaims,
      rejectedClaims,
      completedHandovers,
      totalHandovers,
    ] = await Promise.all([
      this.prisma.claim.count(),
      this.prisma.claim.count({
        where: {
          status: { in: [ClaimStatus.APPROVED, ClaimStatus.COMPLETED] },
        },
      }),
      this.prisma.claim.count({ where: { status: ClaimStatus.REJECTED } }),
      this.prisma.handover.count({
        where: { status: HandoverStatus.COMPLETED },
      }),
      this.prisma.handover.count(),
    ]);

    const evaluatedClaims = approvedClaims + rejectedClaims;

    return {
      claimApprovalRate:
        evaluatedClaims > 0
          ? Math.round((approvedClaims / evaluatedClaims) * 100)
          : 0,
      handoverCompletionRate:
        totalHandovers > 0
          ? Math.round((completedHandovers / totalHandovers) * 100)
          : 0,
      totalClaims,
      totalHandovers,
      completedHandovers,
    };
  }

  /**
   * Paginated & Searchable Admin User Management List
   */
  async getUsers(dto: QueryAdminUsersDto) {
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 50);
    const page = Math.max(Number(dto.page) || 1, 1);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.search && dto.search.trim()) {
      const q = dto.search.trim();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { rollNo: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (dto.role) where.role = dto.role;
    if (dto.isVerified === 'true') where.isVerified = true;
    if (dto.isVerified === 'false') where.isVerified = false;
    if (dto.isActive === 'true') where.isActive = true;
    if (dto.isActive === 'false') where.isActive = false;

    const allowedSortFields = [
      'createdAt',
      'trustScore',
      'username',
      'email',
      'role',
    ];
    const sortBy = allowedSortFields.includes(dto.sortBy || '')
      ? dto.sortBy
      : 'createdAt';
    const sortOrder = dto.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          rollNo: true,
          department: true,
          year: true,
          section: true,
          trustScore: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Update User Role (Audited)
   */
  async updateUserRole(targetUserId: string, newRole: Role, adminId: string) {
    if (targetUserId === adminId && newRole !== Role.ADMIN) {
      throw new ConflictException(
        'An admin cannot demote themselves. Ask another administrator.'
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${targetUserId}" not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    await this.auditService.logAction(
      AuditAction.ROLE_CHANGED,
      'User',
      targetUserId,
      adminId,
      { previousRole: user.role, newRole }
    );

    return updated;
  }

  /**
   * Admin: Toggle User Verification Status (Audited)
   */
  async updateUserVerify(
    targetUserId: string,
    isVerified: boolean,
    adminId: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${targetUserId}" not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isVerified },
      select: {
        id: true,
        username: true,
        isVerified: true,
      },
    });

    await this.auditService.logAction(
      AuditAction.USER_VERIFIED,
      'User',
      targetUserId,
      adminId,
      { previousVerification: user.isVerified, newVerification: isVerified }
    );

    return updated;
  }

  /**
   * Admin: Toggle User Account Active Status (Audited)
   */
  async updateUserStatus(
    targetUserId: string,
    isActive: boolean,
    reason: string | undefined,
    adminId: string
  ) {
    if (targetUserId === adminId && !isActive) {
      throw new ConflictException(
        'An admin cannot deactivate their own account.'
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${targetUserId}" not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: {
        id: true,
        username: true,
        isActive: true,
      },
    });

    const action = isActive
      ? AuditAction.USER_REACTIVATED
      : AuditAction.USER_DEACTIVATED;

    await this.auditService.logAction(action, 'User', targetUserId, adminId, {
      previousState: user.isActive,
      newState: isActive,
      reason,
    });

    return updated;
  }

  /**
   * Server-side Paginated Audit Logs Viewer
   */
  async getAuditLogs(dto: QueryAuditLogsDto) {
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 50);
    const page = Math.max(Number(dto.page) || 1, 1);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.action) where.action = dto.action;
    if (dto.actorId) where.actorId = dto.actorId;

    if (dto.from || dto.to) {
      const { startDate, endDate } = this.parseDateRange(dto.from, dto.to);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          actorId: true,
          action: true,
          entityType: true,
          entityId: true,
          metadata: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
