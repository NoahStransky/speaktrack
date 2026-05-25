import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const ninetyDaysAgo = startOfDay(subDays(new Date(), 90));

  const where: Record<string, unknown> = {
    userId: session.user.id,
    date: {
      gte: from ? startOfDay(new Date(from)) : ninetyDaysAgo,
    },
  };

  if (to) {
    (where.date as Record<string, unknown>).lte = startOfDay(new Date(to));
  }

  const logs = await prisma.dailyLog.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const today = startOfDay(new Date());

  const log = await prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
    create: {
      userId: session.user.id,
      date: today,
      shadowingDone: body.shadowingDone ?? false,
      shadowingMinutes: body.shadowingMinutes ?? 0,
      voiceNoteDone: body.voiceNoteDone ?? false,
      coffeeChatDone: body.coffeeChatDone ?? false,
      notes: body.notes ?? '',
      energyLevel: body.energyLevel ?? 3,
    },
    update: {
      shadowingDone: body.shadowingDone ?? false,
      shadowingMinutes: body.shadowingMinutes ?? 0,
      voiceNoteDone: body.voiceNoteDone ?? false,
      coffeeChatDone: body.coffeeChatDone ?? false,
      notes: body.notes ?? '',
      energyLevel: body.energyLevel ?? 3,
    },
  });

  return NextResponse.json(log);
}
