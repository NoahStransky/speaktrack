import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ninetyDaysAgo = startOfDay(subDays(new Date(), 90));

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      date: { gte: ninetyDaysAgo },
    },
    orderBy: { date: 'desc' },
  });

  const totalDays = logs.length;
  const totalShadowingMinutes = logs.reduce((sum, log) => sum + log.shadowingMinutes, 0);
  const totalVoiceNotes = logs.filter((log) => log.voiceNoteDone).length;
  const totalCoffeeChats = logs.filter((log) => log.coffeeChatDone).length;

  // Compute streak: consecutive days from today backwards
  let streak = 0;
  const today = startOfDay(new Date());
  const dateSet = new Set(logs.map((log) => startOfDay(log.date).toISOString()));

  for (let i = 0; i < 90; i++) {
    const checkDate = startOfDay(subDays(today, i)).toISOString();
    if (dateSet.has(checkDate)) {
      streak++;
    } else {
      break;
    }
  }

  return NextResponse.json({
    streak,
    totalDays,
    totalShadowingMinutes,
    totalVoiceNotes,
    totalCoffeeChats,
  });
}
