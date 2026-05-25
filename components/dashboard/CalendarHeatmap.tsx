'use client';

import { Card, Tooltip, Typography } from 'antd';
import { subDays, startOfDay, format } from 'date-fns';

const { Text } = Typography;

function getColor(count: number): string {
  if (count === 0) return '#ebedf0';
  if (count === 1) return '#9be9a8';
  if (count === 2) return '#40c463';
  return '#216e39';
}

type LogEntry = { date: string; shadowingDone: boolean; voiceNoteDone: boolean; coffeeChatDone: boolean };

export default function CalendarHeatmap({ logs }: { logs: LogEntry[] }) {
  const today = startOfDay(new Date());
  const days: { date: Date; count: number }[] = [];

  for (let i = 83; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find((l) => format(new Date(l.date), 'yyyy-MM-dd') === dateStr);
    const count = [log?.shadowingDone, log?.voiceNoteDone, log?.coffeeChatDone].filter(Boolean).length;
    days.push({ date: d, count });
  }

  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <Card title="Practice Calendar (12 weeks)" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <Tooltip key={di} title={`${format(day.date, 'MMM d')}: ${day.count} activities`}>
                <div style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: getColor(day.count) }} />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Less</Text>
        {['#ebedf0', '#9be9a8', '#40c463', '#216e39'].map((c) => (<div key={c} style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: c }} />))}
        <Text type="secondary" style={{ fontSize: 12 }}>More</Text>
      </div>
    </Card>
  );
}
