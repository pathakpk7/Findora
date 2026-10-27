import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ItemStatus,
  MatchConfidence,
  MatchSource,
  NotificationType,
  Role,
} from '@prisma/client';
import { PrismaService } from '../config/prisma/prisma.service';
import { GeminiMatchingProvider } from './providers/gemini-matching.provider';
import { RuleBasedMatchingProvider } from './providers/rule-based-matching.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { QueryMatchesDto } from './dto/query-matches.dto';
import {
  LostReportInput,
  MatchCandidateInput,
} from './interfaces/match-candidate.interface';
import { RawMatchScore } from './interfaces/match-result.interface';

const DISCLAIMER_TEXT =
  "AI-assisted suggestion. This match is not proof of ownership. Ownership is verified separately through Findora's claim review process.";

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiProvider: GeminiMatchingProvider,
    private readonly ruleBasedProvider: RuleBasedMatchingProvider,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * Safe public item select - NEVER includes private verification information
   */
  private readonly publicItemSelect = {
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

  /**
   * Find matching found items for a specific lost report
   */
  async findMatchesForLostReport(
    lostReportId: string,
    requesterId: string,
    requesterRole: Role,
    query: QueryMatchesDto
  ) {
    const { limit = 10, minScore = 0, forceRefresh = false } = query;
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safeMinScore = Math.min(Math.max(Number(minScore) || 0, 0), 100);

    // 1. Fetch Lost Report & Verify Ownership / Staff Authorization
    const lostReport = await this.prisma.lostReport.findUnique({
      where: { id: lostReportId },
    });

    if (!lostReport) {
      throw new NotFoundException(
        `Lost report with ID "${lostReportId}" not found`
      );
    }

    if (
      lostReport.reporterId !== requesterId &&
      requesterRole !== Role.MODERATOR &&
      requesterRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to view matches for this lost report'
      );
    }

    // 2. Check for cached/stored matches if forceRefresh is false
    if (!forceRefresh) {
      const existingMatches = await this.prisma.lostReportMatch.findMany({
        where: {
          lostReportId,
          score: { gte: safeMinScore },
          foundItem: { status: ItemStatus.APPROVED },
        },
        orderBy: { score: 'desc' },
        take: safeLimit,
        include: {
          foundItem: { select: this.publicItemSelect },
        },
      });

      if (existingMatches.length > 0) {
        return {
          lostReportId,
          count: existingMatches.length,
          source: existingMatches[0].source,
          matches: existingMatches,
          disclaimer: DISCLAIMER_TEXT,
        };
      }
    }

    // 3. Candidate Selection: Fetch APPROVED found items (Max 50 candidates)
    const candidateItems = await this.prisma.foundItem.findMany({
      where: {
        status: ItemStatus.APPROVED,
        OR: [
          { category: lostReport.category },
          {
            foundLocation: {
              contains: lostReport.lostLocation,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: this.publicItemSelect,
      orderBy: { foundDate: 'desc' },
      take: 50,
    });

    // Fallback search if zero candidates found in same category/location
    let finalCandidates = candidateItems;
    if (finalCandidates.length === 0) {
      finalCandidates = await this.prisma.foundItem.findMany({
        where: { status: ItemStatus.APPROVED },
        select: this.publicItemSelect,
        orderBy: { foundDate: 'desc' },
        take: 30,
      });
    }

    if (finalCandidates.length === 0) {
      return {
        lostReportId,
        count: 0,
        source: MatchSource.RULE_BASED,
        matches: [],
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    // 4. Sanitize inputs - NEVER pass private verification data or PII to matching providers
    const lostReportInput: LostReportInput = {
      id: lostReport.id,
      title: lostReport.title,
      category: lostReport.category,
      description: lostReport.description,
      lostLocation: lostReport.lostLocation,
      lostDate: lostReport.lostDate,
      identifyingCharacteristics: lostReport.identifyingCharacteristics,
    };

    const candidateInputs: MatchCandidateInput[] = finalCandidates.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      publicDescription: c.publicDescription,
      foundLocation: c.foundLocation,
      foundDate: c.foundDate,
    }));

    // 5. Compute Matches using AI Provider with fallback to RuleBased Provider
    let rawScores: RawMatchScore[] = [];
    let matchSource: MatchSource = MatchSource.RULE_BASED;

    try {
      rawScores = await this.geminiProvider.findMatches(
        lostReportInput,
        candidateInputs
      );
      matchSource = MatchSource.AI;
    } catch (aiError: any) {
      this.logger.debug(
        `Gemini provider unavailable or failed (${aiError.message}). Using RuleBasedMatchingProvider.`
      );
      rawScores = await this.ruleBasedProvider.findMatches(
        lostReportInput,
        candidateInputs
      );
      matchSource = MatchSource.RULE_BASED;
    }

    // 6. Filter by minScore and limit
    const filteredScores = rawScores
      .filter(s => s.score >= safeMinScore)
      .slice(0, safeLimit);

    // 7. Persist matches in PostgreSQL using transaction
    const upsertedMatches = await this.prisma.$transaction(async tx => {
      const persisted = [];
      for (const raw of filteredScores) {
        const item = await tx.lostReportMatch.upsert({
          where: {
            lostReportId_foundItemId: {
              lostReportId,
              foundItemId: raw.foundItemId,
            },
          },
          create: {
            lostReportId,
            foundItemId: raw.foundItemId,
            score: raw.score,
            confidence: raw.confidence,
            source: matchSource,
            reasons: raw.reasons,
          },
          update: {
            score: raw.score,
            confidence: raw.confidence,
            source: matchSource,
            reasons: raw.reasons,
          },
          include: {
            foundItem: { select: this.publicItemSelect },
          },
        });
        persisted.push(item);
      }
      return persisted;
    });

    // 8. Send notification to lost report owner if high confidence match found
    const highMatches = upsertedMatches.filter(
      m => m.confidence === MatchConfidence.HIGH || m.score >= 70
    );

    if (highMatches.length > 0 && lostReport.reporterId) {
      try {
        await this.notificationsService.createNotification(
          lostReport.reporterId,
          NotificationType.POSSIBLE_MATCH,
          'Possible Item Match Found',
          `We identified ${highMatches.length} possible matching found item(s) for your lost report "${lostReport.title}".`,
          `/lost-reports/${lostReportId}`
        );
      } catch (notifErr: any) {
        this.logger.warn(
          `Failed to send match notification: ${notifErr.message}`
        );
      }
    }

    return {
      lostReportId,
      count: upsertedMatches.length,
      source: matchSource,
      matches: upsertedMatches,
      disclaimer: DISCLAIMER_TEXT,
    };
  }
}
