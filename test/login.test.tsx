import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockPush, mockSignIn, mockMessageError } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignIn: vi.fn(),
  mockMessageError: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      ...actual.message,
      error: mockMessageError,
    },
  };
});

import LoginPage from '@/app/(auth)/login/page';

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password input fields', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders a login button', () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('renders a link to the registration page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('calls signIn with credentials on form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false,
    });
  });

  it('shows error message on invalid credentials', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    expect(mockMessageError).toHaveBeenCalledWith('Invalid email or password');
  });

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
