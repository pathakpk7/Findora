import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Mock AuthProvider's useAuth
const mockLogin = jest.fn();
jest.mock('../../lib/AuthProvider', () => ({ useAuth: () => ({ login: (d: any) => mockLogin(d) }) }));

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders form and validates inputs', async () => {
    render(<LoginPage />);

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /sign in/i });

    // submit empty
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument());

    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(password, { target: { value: 'pass' } });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument());

    fireEvent.change(password, { target: { value: 'password123' } });
    fireEvent.click(button);
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' }));
  });
});
