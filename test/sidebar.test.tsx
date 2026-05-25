import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User', email: 'test@test.com' } },
    status: 'authenticated',
  }),
  signOut: vi.fn(),
}));

import AppSidebar from '@/components/layout/AppSidebar';

describe('AppSidebar', () => {
  it('renders navigation menu items', () => {
    render(<AppSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Daily Log')).toBeInTheDocument();
    expect(screen.getByText('Voice Notes')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
});
