import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = startOfDay(new Date());

  const log = await prisma.dailyLog.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: today,
        lt: startOfDay(new Date(today.getTime() + 86400000)),
      },
    },
  });

  return NextResponse.json(log);
}
