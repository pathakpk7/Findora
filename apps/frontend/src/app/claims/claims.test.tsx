import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { EmptyClaims } from '@/components/claims/EmptyClaims';
import { ClaimStatus, Claim } from '@findora/types';

const mockClaim: Claim & { foundItem?: any } = {
  id: 'claim-123',
  foundItemId: 'item-456',
  claimantId: 'user-789',
  evidence: 'My initials AP are written inside the right pocket.',
  status: ClaimStatus.PENDING,
  createdAt: new Date('2026-09-01T10:00:00.000Z'),
  updatedAt: new Date('2026-09-01T10:00:00.000Z'),
  foundItem: {
    title: 'Black Leather Backpack',
    category: 'BAG',
  },
};

describe('Phase 8 Claims Frontend Components', () => {
  describe('ClaimStatusBadge', () => {
    it('renders correct status text for all claim statuses', () => {
      render(<ClaimStatusBadge status={ClaimStatus.PENDING} />);
      expect(screen.getByText('Pending Review')).toBeInTheDocument();

      render(<ClaimStatusBadge status={ClaimStatus.APPROVED} />);
      expect(screen.getByText('Claim Approved')).toBeInTheDocument();

      render(<ClaimStatusBadge status={ClaimStatus.REJECTED} />);
      expect(screen.getByText('Claim Rejected')).toBeInTheDocument();

      render(<ClaimStatusBadge status={ClaimStatus.CANCELLED} />);
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('ClaimCard', () => {
    it('renders claim item title, category, status badge, and private evidence statement', () => {
      render(<ClaimCard claim={mockClaim} />);

      expect(screen.getByText('Black Leather Backpack')).toBeInTheDocument();
      expect(screen.getByText('BAG')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText(/My initials AP are written inside/i)).toBeInTheDocument();
    });
  });

  describe('EmptyClaims', () => {
    it('renders empty claims message and CTA button', () => {
      render(<EmptyClaims />);

      expect(screen.getByText('No Ownership Claims Found')).toBeInTheDocument();
      expect(screen.getByText('Browse Public Inventory')).toBeInTheDocument();
    });
  });
});
