import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LostReportStatusBadge } from '@/components/lost-reports/LostReportStatusBadge';
import { LostReportCard } from '@/components/lost-reports/LostReportCard';
import { EmptyLostReports } from '@/components/lost-reports/EmptyLostReports';
import { ItemCategory, LostReportStatus, LostReport } from '@findora/types';

const mockLostReport: LostReport = {
  id: 'report-123',
  reporterId: 'user-789',
  title: 'Lost Blue Sony Headphones',
  category: ItemCategory.ELECTRONICS,
  description: 'Left in Science Building Room 101',
  lostLocation: 'Science Building',
  lostDate: new Date('2026-09-01T00:00:00.000Z'),
  images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
  identifyingCharacteristics: 'Scratch on right earcup',
  status: LostReportStatus.ACTIVE,
  createdAt: new Date('2026-09-01T10:00:00.000Z'),
  updatedAt: new Date('2026-09-01T10:00:00.000Z'),
};

describe('Phase 7 Lost Reports Frontend Components', () => {
  describe('LostReportStatusBadge', () => {
    it('renders correct labels for status values', () => {
      render(<LostReportStatusBadge status={LostReportStatus.ACTIVE} />);
      expect(screen.getByText('Active Search')).toBeInTheDocument();

      render(<LostReportStatusBadge status={LostReportStatus.MATCHED} />);
      expect(screen.getByText('Potential Match')).toBeInTheDocument();

      render(<LostReportStatusBadge status={LostReportStatus.RECOVERED} />);
      expect(screen.getByText('Recovered')).toBeInTheDocument();

      render(<LostReportStatusBadge status={LostReportStatus.CANCELLED} />);
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('LostReportCard', () => {
    it('renders card title, category, location, and Private Report badge', () => {
      render(<LostReportCard report={mockLostReport} />);

      expect(screen.getByText('Lost Blue Sony Headphones')).toBeInTheDocument();
      expect(screen.getByText('ELECTRONICS')).toBeInTheDocument();
      expect(screen.getByText('Science Building')).toBeInTheDocument();
      expect(screen.getByText('Active Search')).toBeInTheDocument();
      expect(screen.getByText('Private Report')).toBeInTheDocument();
    });
  });

  describe('EmptyLostReports', () => {
    it('renders empty state text and report button', () => {
      render(<EmptyLostReports />);

      expect(screen.getByText('No Lost Reports Found')).toBeInTheDocument();
      expect(screen.getByText('Report Lost Item')).toBeInTheDocument();
    });
  });
});
