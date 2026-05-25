'use client';

import { Card, Row, Col, Statistic } from 'antd';
import { FireOutlined, CheckSquareOutlined, AudioOutlined, ClockCircleOutlined, CoffeeOutlined } from '@ant-design/icons';

type Stats = {
  streak: number;
  totalDays: number;
  totalShadowingMinutes: number;
  totalVoiceNotes: number;
  totalCoffeeChats: number;
};

export default function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Current Streak" value={stats.streak} suffix="days" prefix={<FireOutlined />} valueStyle={{ color: '#fa8c16' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Active Days" value={stats.totalDays} prefix={<CheckSquareOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Shadowing" value={stats.totalShadowingMinutes} suffix="min" prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Voice Notes" value={stats.totalVoiceNotes} prefix={<AudioOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
      </Col>
    </Row>
  );
}
