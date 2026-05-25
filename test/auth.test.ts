import { describe, it, expect, vi } from 'vitest';

// Mock NextAuth before importing our module
vi.mock('next-auth', () => {
  const mockHandlers = {
    GET: vi.fn(),
    POST: vi.fn(),
  };
  return {
    default: vi.fn(() => ({
      handlers: mockHandlers,
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })),
  };
});

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(() => ({ type: 'credentials' })),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('NextAuth configuration', () => {
  it('lib/auth exports handlers, auth, signIn, signOut', async () => {
    const mod = await import('@/lib/auth');
    expect(mod).toHaveProperty('handlers');
    expect(mod).toHaveProperty('auth');
    expect(mod).toHaveProperty('signIn');
    expect(mod).toHaveProperty('signOut');
  });

  it('handlers exports GET and POST', async () => {
    const mod = await import('@/lib/auth');
    expect(mod.handlers).toHaveProperty('GET');
    expect(mod.handlers).toHaveProperty('POST');
  });

  it('auth is a function', async () => {
    const mod = await import('@/lib/auth');
    expect(typeof mod.auth).toBe('function');
  });

  it('app/api/auth/[...nextauth]/route exports GET and POST', async () => {
    const mod = await import('@/app/api/auth/[...nextauth]/route');
    expect(mod).toHaveProperty('GET');
    expect(mod).toHaveProperty('POST');
  });
});
