import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation before the page component is imported
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// --- API route test ---

// Mock bcryptjs and prisma before importing the route
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Registration API route', () => {
  it('exports a POST handler', async () => {
    const mod = await import('@/app/api/auth/register/route');
    expect(mod).toHaveProperty('POST');
    expect(typeof mod.POST).toBe('function');
  });
});

// --- Registration page component test ---

describe('Registration page', () => {
  it('renders the registration form with email, password, name fields and login link', async () => {
    const { default: RegisterPage } = await import('@/app/(auth)/register/page');
    render(<RegisterPage />);

    // Check for the title
    expect(screen.getByText('Create Account')).toBeInTheDocument();

    // Check for email input by placeholder
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();

    // Check for password input by placeholder
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();

    // Check for name input by placeholder
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();

    // Check for register button
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

    // Check for login link
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  }, 30000);
});
