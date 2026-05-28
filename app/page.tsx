'use client';

import Link from 'next/link';
import { Typography, Button, Card, Row, Col, Space, Layout } from 'antd';
import {
  CheckCircleOutlined,
  AudioOutlined,
  BookOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Footer: AntFooter } = Layout;

const features = [
  {
    key: 'habit',
    icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Daily Habit Tracking',
    description:
      'Build a consistent speaking habit with daily goals and streak tracking. Never miss a day of practice.',
  },
  {
    key: 'voice',
    icon: <AudioOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Voice Note Journal',
    description:
      'Record and review your voice notes to track pronunciation improvements over time.',
  },
  {
    key: 'library',
    icon: <BookOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Resource Library',
    description:
      'Access curated English speaking resources, exercises, and tips to accelerate your learning.',
  },
  {
    key: 'dashboard',
    icon: <LineChartOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Progress Dashboard',
    description:
      'Visualize your improvement with charts and metrics. See how far you have come at a glance.',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <Title
          level={1}
          style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}
        >
          SpeakTrack
        </Title>
        <Paragraph
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 20,
            maxWidth: 600,
            margin: '0 auto 32px',
          }}
        >
          Track your English speaking practice, build daily habits, and watch your
          fluency grow with voice notes and progress dashboards.
        </Paragraph>
        <Space size="middle" wrap>
          <Link href="/register" legacyBehavior passHref>
            <Button type="default" size="large">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login" legacyBehavior passHref>
            <Button
              ghost
              size="large"
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              Sign In
            </Button>
          </Link>
        </Space>
      </div>

      {/* Features Section */}
      <div style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Features
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature) => (
            <Col key={feature.key} xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                styles={{ body: { padding: 32 } }}
              >
                <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {feature.title}
                </Title>
                <Text type="secondary">{feature.description}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Footer */}
      <AntFooter style={{ textAlign: 'center', background: '#f5f5f5' }}>
        <Text type="secondary">
          SpeakTrack — Open Source (MIT) · Built with Next.js & Ant Design
        </Text>
      </AntFooter>
    </div>
  );
}
