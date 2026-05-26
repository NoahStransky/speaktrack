'use client';

import { useState, useEffect } from 'react';
import { Card, Empty, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type RatingPoint = { date: string; rating: number };

export default function RatingTrendChart() {
  const [data, setData] = useState<RatingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/voice/ratings')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card title="Speaking Confidence Trend"><Spin style={{ display: 'block', margin: '40px auto' }} /></Card>;
  if (data.length < 2) return <Card title="Speaking Confidence Trend"><Empty description="Record at least 2 voice notes to see your trend" /></Card>;

  // Compute moving average (window of 3)
  const smoothed = data.map((point, i, arr) => {
    const start = Math.max(0, i - 1);
    const end = Math.min(arr.length, i + 2);
    const window = arr.slice(start, end);
    const avg = window.reduce((s, p) => s + p.rating, 0) / window.length;
    return { ...point, movingAvg: Math.round(avg * 10) / 10 };
  });

  return (
    <Card title="📈 Speaking Confidence Trend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={smoothed} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => ['', '😰', '😐', '🙂', '😊', '🔥'][v] || ''} />
          <Tooltip
            formatter={(value: number, name: string) => [name === 'movingAvg' ? `${value} (avg)` : value, name === 'movingAvg' ? 'Trend' : 'Rating']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <ReferenceLine y={3} stroke="#bfbfbf" strokeDasharray="5 5" label={{ value: 'Baseline', position: 'insideBottomRight', fontSize: 10 }} />
          <Line type="monotone" dataKey="rating" stroke="#d9d9d9" strokeWidth={1} dot={{ r: 3, fill: '#d9d9d9' }} name="Rating" />
          <Line type="monotone" dataKey="movingAvg" stroke="#1677ff" strokeWidth={3} dot={{ r: 4, fill: '#1677ff' }} name="Trend" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
