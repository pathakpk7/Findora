import { MatchConfidence, MatchSource } from '@prisma/client';

export interface RawMatchScore {
  foundItemId: string;
  score: number;
  confidence: MatchConfidence;
  reasons: string[];
  source: MatchSource;
}
