import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyLog: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe('Logs API routes', () => {
  it('exports GET and POST handlers from /api/logs', async () => {
    const mod = await import('@/app/api/logs/route');
    expect(mod).toHaveProperty('GET');
    expect(mod).toHaveProperty('POST');
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');
  });

  it('exports GET handler from /api/logs/today', async () => {
    const mod = await import('@/app/api/logs/today/route');
    expect(mod).toHaveProperty('GET');
    expect(typeof mod.GET).toBe('function');
  });

  it('exports GET handler from /api/logs/stats', async () => {
    const mod = await import('@/app/api/logs/stats/route');
    expect(mod).toHaveProperty('GET');
    expect(typeof mod.GET).toBe('function');
  });
});
