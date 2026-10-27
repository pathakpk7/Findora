import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

describe('Phase 11 Notifications Frontend Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NotificationBadge', () => {
    it('returns null when unread count is 0 or token missing', () => {
      const { container } = render(<NotificationBadge />);
      expect(container.firstChild).toBeNull();
    });
  });
});
