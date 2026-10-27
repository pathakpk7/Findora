import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrustScoreCard } from '@/components/reputation/TrustScoreCard';

describe('Phase 12 Gamification Frontend Components', () => {
  describe('TrustScoreCard', () => {
    it('renders trust score and level name correctly', () => {
      render(
        <TrustScoreCard
          trustScore={180}
          level={3}
          levelName="Trusted Finder"
          nextLevelScore={300}
          progressPercent={20}
        />,
      );

      expect(screen.getByText('Trusted Finder')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('Campus Reputation Level 3')).toBeInTheDocument();
    });
  });
});
