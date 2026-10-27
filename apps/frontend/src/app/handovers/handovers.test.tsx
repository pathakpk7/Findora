import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HandoverStatusBadge } from '@/components/handovers/HandoverStatusBadge';
import { QRCodeDisplay } from '@/components/handovers/QRCodeDisplay';
import { HandoverStatus } from '@findora/types';

describe('Phase 10 Handovers Frontend Components', () => {
  describe('HandoverStatusBadge', () => {
    it('renders correct status label for all handover states', () => {
      render(<HandoverStatusBadge status={HandoverStatus.PENDING} />);
      expect(screen.getByText('Handover Active')).toBeInTheDocument();

      render(<HandoverStatusBadge status={HandoverStatus.COMPLETED} />);
      expect(screen.getByText('Returned & Completed')).toBeInTheDocument();

      render(<HandoverStatusBadge status={HandoverStatus.EXPIRED} />);
      expect(screen.getByText('QR Expired')).toBeInTheDocument();

      render(<HandoverStatusBadge status={HandoverStatus.CANCELLED} />);
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('QRCodeDisplay', () => {
    it('renders pure SVG matrix elements representing token value', () => {
      const { container } = render(
        <QRCodeDisplay value="test-handover-raw-token-1234567890" size={200} />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '200');
    });
  });
});
