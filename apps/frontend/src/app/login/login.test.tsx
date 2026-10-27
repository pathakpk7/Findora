import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthProvider's useAuth
const mockLogin = jest.fn();
jest.mock('../../lib/AuthProvider', () => ({
  useAuth: () => ({ login: (d: any) => mockLogin(d) }),
}));

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders form and validates inputs', async () => {
    const { container } = render(<LoginPage />);

    const email = screen.getByPlaceholderText(/name@university.edu/i);
    const password = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeInTheDocument();

    // submit empty
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(screen.getByText(/enter a valid student\/campus email/i)).toBeInTheDocument()
    );

    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(password, { target: { value: 'pass' } });
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    );

    fireEvent.change(password, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    );
  });
});
