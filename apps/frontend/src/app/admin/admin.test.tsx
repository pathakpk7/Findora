import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { Users } from 'lucide-react';

describe('Phase 13 Admin Dashboard Frontend Components', () => {
  describe('AdminStatCard', () => {
    it('renders title, metric value, and subtitle correctly', () => {
      render(
        <AdminStatCard
          title="Total Users"
          value={150}
          subtitle="120 Verified | 145 Active"
          icon={Users}
          color="blue"
          trend="+12 in selected period"
        />,
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('120 Verified | 145 Active')).toBeInTheDocument();
      expect(screen.getByText('+12 in selected period')).toBeInTheDocument();
    });
  });
});
