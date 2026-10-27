import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FoundItemStatusBadge } from '@/components/found-items/FoundItemStatusBadge';
import { FoundItemCard } from '@/components/found-items/FoundItemCard';
import { FoundItemFilters } from '@/components/found-items/FoundItemFilters';
import { EmptyFoundItems } from '@/components/found-items/EmptyFoundItems';
import { FoundItemGallery } from '@/components/found-items/FoundItemGallery';
import { ItemCategory, ItemStatus, PublicFoundItem } from '@findora/types';

const mockPublicItem: PublicFoundItem = {
  id: 'item-123',
  title: 'Black Wireless Earbuds',
  category: ItemCategory.EARBUDS,
  publicDescription: 'Found near library entrance on 2nd floor.',
  foundLocation: 'Main Library 2nd Floor',
  foundDate: new Date('2026-09-01T00:00:00.000Z'),
  status: ItemStatus.APPROVED,
  publicImages: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
  foundById: 'user-456',
  createdAt: new Date('2026-09-01T10:00:00.000Z'),
  updatedAt: new Date('2026-09-01T10:00:00.000Z'),
};

describe('Phase 4 Found Items Frontend Components', () => {
  describe('FoundItemStatusBadge', () => {
    it('renders correct labels for statuses', () => {
      render(<FoundItemStatusBadge status={ItemStatus.PENDING} />);
      expect(screen.getByText('Awaiting Review')).toBeInTheDocument();

      render(<FoundItemStatusBadge status={ItemStatus.APPROVED} />);
      expect(screen.getByText('Published')).toBeInTheDocument();

      render(<FoundItemStatusBadge status={ItemStatus.REJECTED} />);
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });
  });

  describe('FoundItemCard', () => {
    it('displays public information only and never renders private fields', () => {
      render(<FoundItemCard item={mockPublicItem} />);

      expect(screen.getByText('Black Wireless Earbuds')).toBeInTheDocument();
      expect(screen.getByText('Found near library entrance on 2nd floor.')).toBeInTheDocument();
      expect(screen.getByText('Main Library 2nd Floor')).toBeInTheDocument();
      expect(screen.getByText('EARBUDS')).toBeInTheDocument();

      // Ensure private fields are NOT present
      expect(screen.queryByText(/serialNumber/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/hiddenMarks/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/privateNotes/i)).not.toBeInTheDocument();
    });
  });

  describe('FoundItemGallery', () => {
    it('renders fallback when no images provided', () => {
      render(<FoundItemGallery images={[]} title="Test Item" />);
      expect(screen.getByText('No image provided by finder')).toBeInTheDocument();
    });

    it('renders image gallery when publicImages exist', () => {
      render(<FoundItemGallery images={['http://test.com/img1.jpg']} title="Test Item" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'http://test.com/img1.jpg');
    });
  });

  describe('EmptyFoundItems', () => {
    it('renders empty state text and action buttons', () => {
      const handleReset = jest.fn();
      render(
        <EmptyFoundItems
          title="No found items matching search"
          onClearFilters={handleReset}
        />,
      );

      expect(screen.getByText('No found items matching search')).toBeInTheDocument();
      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('FoundItemFilters', () => {
    it('triggers filter callback on search/category change', async () => {
      const handleFilterChange = jest.fn();
      render(<FoundItemFilters onFilterChange={handleFilterChange} />);

      const searchInput = screen.getByPlaceholderText(/Search keywords/i);
      fireEvent.change(searchInput, { target: { value: 'Sony' } });

      await waitFor(() => {
        expect(handleFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Sony' }),
        );
      });
    });
  });
});
