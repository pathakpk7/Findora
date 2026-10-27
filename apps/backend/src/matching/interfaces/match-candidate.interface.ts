import { ItemCategory } from '@prisma/client';

export interface MatchCandidateInput {
  id: string;
  title: string;
  category: ItemCategory;
  publicDescription: string;
  foundLocation: string;
  foundDate: Date;
}

export interface LostReportInput {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  lostLocation: string;
  lostDate: Date;
  identifyingCharacteristics?: string | null;
}
