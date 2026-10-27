import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  HandoverStatus,
  ItemStatus,
  NotificationType,
} from '@prisma/client';

export interface LevelInfo {
  level: number;
  levelName: string;
  nextLevelScore: number;
  progressPercent: number;
}

export function calculateLevelInfo(trustScore: number): LevelInfo {
  const score = Math.max(0, trustScore);

  if (score >= 500) {
    return {
      level: 5,
      levelName: 'Findora Hero',
      nextLevelScore: 1000,
      progressPercent: 100,
    };
  }
  if (score >= 300) {
    const min = 300;
    const max = 500;
    return {
      level: 4,
      levelName: 'Campus Guardian',
      nextLevelScore: 500,
      progressPercent: Math.round(((score - min) / (max - min)) * 100),
    };
  }
  if (score >= 150) {
    const min = 150;
    const max = 300;
    return {
      level: 3,
      levelName: 'Trusted Finder',
      nextLevelScore: 300,
      progressPercent: Math.round(((score - min) / (max - min)) * 100),
    };
  }
  if (score >= 50) {
    const min = 50;
    const max = 150;
    return {
      level: 2,
      levelName: 'Contributor',
      nextLevelScore: 150,
      progressPercent: Math.round(((score - min) / (max - min)) * 100),
    };
  }

  const min = 0;
  const max = 50;
  return {
    level: 1,
    levelName: 'Novice',
    nextLevelScore: 50,
    progressPercent: Math.round(((score - min) / (max - min)) * 100),
  };
}

export const SYSTEM_BADGES = [
  {
    code: 'FIRST_FIND',
    name: 'First Find',
    icon: '🔍',
    description: 'Submitted your first verified found item report.',
    criteria: '1 Approved Found Item',
  },
  {
    code: 'HELPFUL_FINDER',
    name: 'Helpful Finder',
    icon: '🌟',
    description: 'Submitted 3 or more approved found items.',
    criteria: '3+ Approved Found Items',
  },
  {
    code: 'TRUSTED_FINDER',
    name: 'Trusted Finder',
    icon: '🛡️',
    description: 'Reached 150+ Trust Score in Findora reputation.',
    criteria: '150+ Trust Score',
  },
  {
    code: 'SUCCESSFUL_RETURN',
    name: 'First Return',
    icon: '🤝',
    description: 'Completed your first physical item return handover.',
    criteria: '1 Completed Handover',
  },
  {
    code: 'COMMUNITY_HERO',
    name: 'Community Hero',
    icon: '🏆',
    description: 'Completed 5 or more physical item return handovers.',
    criteria: '5+ Completed Handovers',
  },
  {
    code: 'CAMPUS_GUARDIAN',
    name: 'Campus Guardian',
    icon: '👑',
    description: 'Reached Level 4 Reputation (300+ Trust Score).',
    criteria: '300+ Trust Score',
  },
];

@Injectable()
export class ReputationService implements OnModuleInit {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService
  ) {}

  async onModuleInit() {
    await this.ensureBadgesExist();
  }

  /**
   * Seed standard system badges if missing
   */
  async ensureBadgesExist() {
    try {
      for (const badgeDef of SYSTEM_BADGES) {
        await this.prisma.badge.upsert({
          where: { code: badgeDef.code },
          update: {
            name: badgeDef.name,
            icon: badgeDef.icon,
            description: badgeDef.description,
            criteria: badgeDef.criteria,
          },
          create: badgeDef,
        });
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to ensure system badges exist: ${error?.message || error}`
      );
    }
  }

  /**
   * Central atomic trust score adjustment method with idempotency protection
   */
  async adjustTrustScore(
    userId: string,
    amount: number,
    reason: string,
    sourceType?: string,
    sourceId?: string,
    actorId?: string
  ) {
    if (amount === 0) return;

    // Idempotency check: if sourceType and sourceId are provided, check if already recorded
    if (sourceType && sourceId) {
      const existing = await this.prisma.trustScoreHistory.findFirst({
        where: {
          userId,
          sourceType,
          sourceId,
        },
      });

      if (existing) {
        this.logger.log(
          `Trust score change skipped for user ${userId} (duplicate event ${sourceType}:${sourceId})`
        );
        return existing;
      }
    }

    try {
      const historyEntry = await this.prisma.$transaction(async tx => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, trustScore: true },
        });

        if (!user) {
          throw new NotFoundException(`User with ID "${userId}" not found`);
        }

        const previousScore = user.trustScore;
        const rawNewScore = previousScore + amount;
        const newScore = Math.min(1000, Math.max(0, rawNewScore));
        const actualDelta = newScore - previousScore;

        await tx.user.update({
          where: { id: userId },
          data: { trustScore: newScore },
        });

        return tx.trustScoreHistory.create({
          data: {
            userId,
            amount: actualDelta,
            previousScore,
            newScore,
            reason,
            sourceType: sourceType || null,
            sourceId: sourceId || null,
            actorId: actorId || null,
          },
        });
      });

      // Post-transaction badge evaluation & notification
      await this.evaluateBadges(userId);

      const isPositive = amount > 0;
      await this.notificationsService.createNotification(
        userId,
        NotificationType.TRUST_SCORE_CHANGED,
        'Reputation Score Updated',
        `Your Findora Trust Score ${isPositive ? 'increased by +' : ''}${amount} points (${reason}).`,
        '/profile/reputation'
      );

      return historyEntry;
    } catch (error: any) {
      // Handle race condition on unique constraint idempotency gracefully
      if (error?.code === 'P2002') {
        this.logger.log(
          `Idempotent duplicate score transaction prevented for user ${userId}`
        );
        return;
      }
      this.logger.error(
        `Failed to adjust trust score for user ${userId}: ${error?.message || error}`
      );
      throw error;
    }
  }

  /**
   * Deterministically evaluate and award eligible badges for a user
   */
  async evaluateBadges(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, trustScore: true },
      });

      if (!user) return;

      const [approvedCount, handoversCount, allBadges] = await Promise.all([
        this.prisma.foundItem.count({
          where: {
            foundById: userId,
            status: { in: [ItemStatus.APPROVED, ItemStatus.RETURNED] },
          },
        }),
        this.prisma.handover.count({
          where: {
            status: HandoverStatus.COMPLETED,
            claim: {
              OR: [
                { claimantId: userId },
                { foundItem: { foundById: userId } },
              ],
            },
          },
        }),
        this.prisma.badge.findMany(),
      ]);

      const badgeMap = new Map(allBadges.map(b => [b.code, b]));

      const eligibleCodes: string[] = [];

      if (approvedCount >= 1) eligibleCodes.push('FIRST_FIND');
      if (approvedCount >= 3) eligibleCodes.push('HELPFUL_FINDER');
      if (user.trustScore >= 150) eligibleCodes.push('TRUSTED_FINDER');
      if (handoversCount >= 1) eligibleCodes.push('SUCCESSFUL_RETURN');
      if (handoversCount >= 5) eligibleCodes.push('COMMUNITY_HERO');
      if (user.trustScore >= 300) eligibleCodes.push('CAMPUS_GUARDIAN');

      for (const code of eligibleCodes) {
        const badge = badgeMap.get(code);
        if (!badge) continue;

        try {
          await this.prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });

          // Send Badge Earned Notification
          await this.notificationsService.createNotification(
            userId,
            NotificationType.BADGE_EARNED,
            `New Badge Earned: ${badge.name}!`,
            `Congratulations! You earned the "${badge.name}" badge (${badge.description}).`,
            '/profile/reputation'
          );
        } catch (error: any) {
          // P2002: unique constraint violation means user already has this badge (Idempotent!)
          if (error?.code !== 'P2002') {
            this.logger.error(
              `Error awarding badge ${code} to user ${userId}: ${error?.message || error}`
            );
          }
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Error evaluating badges for user ${userId}: ${error?.message || error}`
      );
    }
  }

  /**
   * Get user's full reputation data (score, level info, earned badges, history)
   */
  async getUserReputation(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trustScore: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const [badges, history] = await Promise.all([
      this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      this.prisma.trustScoreHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    const levelInfo = calculateLevelInfo(user.trustScore);

    return {
      trustScore: user.trustScore,
      ...levelInfo,
      badges,
      history,
    };
  }

  /**
   * Get public leaderboard with bounded pagination
   */
  async getLeaderboard(page = 1, limit = 20) {
    const boundedLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const boundedPage = Math.max(Number(page) || 1, 1);
    const skip = (boundedPage - 1) * boundedLimit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isActive: true },
        orderBy: [{ trustScore: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: boundedLimit,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          department: true,
          trustScore: true,
          _count: {
            select: { userBadges: true },
          },
        },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    const data = users.map((u, index) => {
      const levelInfo = calculateLevelInfo(u.trustScore);
      return {
        rank: skip + index + 1,
        id: u.id,
        username: u.username,
        firstName: u.firstName || undefined,
        lastName: u.lastName || undefined,
        avatar: u.avatar || undefined,
        department: u.department || undefined,
        trustScore: u.trustScore,
        level: levelInfo.level,
        levelName: levelInfo.levelName,
        badgeCount: u._count.userBadges,
      };
    });

    return {
      data,
      pagination: {
        page: boundedPage,
        limit: boundedLimit,
        total,
        totalPages: Math.ceil(total / boundedLimit) || 1,
      },
    };
  }

  /**
   * Staff/Admin manual reputation adjustment
   */
  async manualAdjust(
    targetUserId: string,
    amount: number,
    reason: string,
    actorId: string
  ) {
    const historyEntry = await this.adjustTrustScore(
      targetUserId,
      amount,
      `Staff Adjustment: ${reason}`,
      'MANUAL_ADJUSTMENT',
      `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId
    );

    // Audit log entry for security audit compliance
    await this.auditService.logAction(
      AuditAction.TRUST_SCORE_CHANGED,
      'User',
      targetUserId,
      actorId,
      { amount, reason }
    );

    return historyEntry;
  }
}
