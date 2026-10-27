import {
  LostReportInput,
  MatchCandidateInput,
} from '../interfaces/match-candidate.interface';
import { RawMatchScore } from '../interfaces/match-result.interface';

export interface MatchingProvider {
  name: string;
  findMatches(
    lostReport: LostReportInput,
    candidates: MatchCandidateInput[]
  ): Promise<RawMatchScore[]>;
}
