import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Daily Log page', () => {
  it('exports a valid React component', async () => {
    const mod = await import('@/app/(dashboard)/log/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  }, 15000);
});
