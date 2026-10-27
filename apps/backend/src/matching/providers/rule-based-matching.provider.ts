import { Injectable } from '@nestjs/common';
import { MatchConfidence, MatchSource } from '@prisma/client';
import { MatchingProvider } from './matching-provider.interface';
import {
  LostReportInput,
  MatchCandidateInput,
} from '../interfaces/match-candidate.interface';
import { RawMatchScore } from '../interfaces/match-result.interface';

@Injectable()
export class RuleBasedMatchingProvider implements MatchingProvider {
  name = 'RuleBasedMatchingProvider';

  async findMatches(
    lostReport: LostReportInput,
    candidates: MatchCandidateInput[]
  ): Promise<RawMatchScore[]> {
    const results: RawMatchScore[] = [];

    for (const candidate of candidates) {
      const match = this.calculateCandidateScore(lostReport, candidate);
      if (match.score > 0) {
        results.push(match);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateCandidateScore(
    lostReport: LostReportInput,
    candidate: MatchCandidateInput
  ): RawMatchScore {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category Similarity (Max 25 pts)
    if (lostReport.category === candidate.category) {
      score += 25;
      reasons.push(`Matching category (${lostReport.category})`);
    }

    // 2. Location Similarity (Max 20 pts)
    const lostLoc = lostReport.lostLocation.toLowerCase().trim();
    const foundLoc = candidate.foundLocation.toLowerCase().trim();

    if (lostLoc === foundLoc) {
      score += 20;
      reasons.push(`Exact location match ("${candidate.foundLocation}")`);
    } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
      score += 12;
      reasons.push(
        `Nearby/overlapping location ("${candidate.foundLocation}")`
      );
    }

    // 3. Date Proximity (Max 15 pts)
    const lostTime = new Date(lostReport.lostDate).getTime();
    const foundTime = new Date(candidate.foundDate).getTime();
    const diffDays = Math.abs(foundTime - lostTime) / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      score += 15;
      reasons.push('Found within 24 hours of loss date');
    } else if (diffDays <= 3) {
      score += 10;
      reasons.push(`Found within ${Math.ceil(diffDays)} days of loss date`);
    } else if (diffDays <= 7) {
      score += 5;
      reasons.push(`Found within ${Math.ceil(diffDays)} days of loss date`);
    }

    // 4. Title Keyword Match (Max 10 pts)
    const lostTitleWords = this.tokenize(lostReport.title);
    const foundTitleWords = this.tokenize(candidate.title);
    const titleOverlap = lostTitleWords.filter(w =>
      foundTitleWords.includes(w)
    );

    if (titleOverlap.length > 0) {
      const titleScore = Math.min(10, titleOverlap.length * 5);
      score += titleScore;
      reasons.push(
        `Title keyword similarity ("${titleOverlap.slice(0, 2).join(', ')}")`
      );
    }

    // 5. Description Keyword Overlap (Max 30 pts)
    const combinedLostText = `${lostReport.description} ${lostReport.identifyingCharacteristics || ''}`;
    const lostDescWords = this.tokenize(combinedLostText);
    const foundDescWords = this.tokenize(candidate.publicDescription);

    const descOverlap = lostDescWords.filter(w => foundDescWords.includes(w));
    if (descOverlap.length > 0) {
      const descScore = Math.min(30, descOverlap.length * 6);
      score += descScore;
      reasons.push(
        `Public description keyword match (${descOverlap.length} terms)`
      );
    }

    const finalScore = Math.min(100, score);

    let confidence: MatchConfidence = MatchConfidence.LOW;
    if (finalScore >= 70) {
      confidence = MatchConfidence.HIGH;
    } else if (finalScore >= 40) {
      confidence = MatchConfidence.MEDIUM;
    }

    return {
      foundItemId: candidate.id,
      score: finalScore,
      confidence,
      reasons: reasons.slice(0, 5),
      source: MatchSource.RULE_BASED,
    };
  }

  private tokenize(text: string): string[] {
    const stopwords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'up',
      'about',
      'into',
      'over',
      'after',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'my',
      'it',
      'its',
      'this',
      'that',
      'these',
      'those',
      'lost',
      'found',
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));
  }
}
