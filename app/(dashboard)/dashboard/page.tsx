'use client';

import { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import StatsCards from '@/components/dashboard/StatsCards';
import CalendarHeatmap from '@/components/dashboard/CalendarHeatmap';
import RecentActivity from '@/components/dashboard/RecentActivity';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <Title level={3}>Dashboard</Title>
      <StatsCards stats={stats} />
      <CalendarHeatmap logs={stats?.logs || []} />
      <RecentActivity logs={stats?.logs || []} />
    </>
  );
}
