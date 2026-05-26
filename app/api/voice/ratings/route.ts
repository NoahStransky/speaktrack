import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notes = await prisma.voiceNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true, selfRating: true, id: true },
    take: 100,
  });

  const ratings = notes.map((n) => ({
    date: n.createdAt.toISOString().split('T')[0],
    rating: n.selfRating,
  }));

  return NextResponse.json(ratings);
}
