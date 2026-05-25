import { describe, it, expect } from 'vitest';

describe('Prisma client singleton', () => {
  it('exports prisma from the lib module', async () => {
    const mod = await import('@/lib/prisma');
    expect(mod).toHaveProperty('prisma');
  });

  it('lib/prisma module can be imported', async () => {
    // Module-level import — if this doesn't throw, the file structure is valid
    const mod = await import('@/lib/prisma');
    expect(mod.prisma).toBeDefined();
  });
});
