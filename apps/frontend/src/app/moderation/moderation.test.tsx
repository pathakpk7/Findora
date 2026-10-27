import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModeratorGuard } from '@/components/moderation/ModeratorGuard';
import { useUser } from '@/lib/useUser';

// Mock useUser
jest.mock('@/lib/useUser', () => ({
  useUser: jest.fn(),
}));

describe('Phase 9 Moderation Frontend Components', () => {
  it('1. Displays access restricted message for standard USER role', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1', role: 'USER', username: 'student' },
      loading: false,
    });

    render(
      <ModeratorGuard>
        <div>Secret Moderation Panel</div>
      </ModeratorGuard>,
    );

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.queryByText('Secret Moderation Panel')).not.toBeInTheDocument();
  });

  it('2. Renders children for MODERATOR role', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'mod-1', role: 'MODERATOR', username: 'staff_mod' },
      loading: false,
    });

    render(
      <ModeratorGuard>
        <div>Secret Moderation Panel</div>
      </ModeratorGuard>,
    );

    expect(screen.getByText('Secret Moderation Panel')).toBeInTheDocument();
  });

  it('3. Renders children for ADMIN role', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'admin-1', role: 'ADMIN', username: 'superadmin' },
      loading: false,
    });

    render(
      <ModeratorGuard>
        <div>Secret Moderation Panel</div>
      </ModeratorGuard>,
    );

    expect(screen.getByText('Secret Moderation Panel')).toBeInTheDocument();
  });
});
