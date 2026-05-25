'use client';

import { Card, List, Tag, Typography } from 'antd';
import { PlayCircleOutlined, AudioOutlined, CoffeeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Text } = Typography;

type LogEntry = {
  id: string; date: string; shadowingDone: boolean; shadowingMinutes: number;
  voiceNoteDone: boolean; coffeeChatDone: boolean; energyLevel: number; notes: string;
};

export default function RecentActivity({ logs }: { logs: LogEntry[] }) {
  return (
    <Card title="Recent Activity">
      <List
        dataSource={logs.slice(0, 14)}
        renderItem={(log) => (
          <List.Item>
            <div>
              <Text strong>{format(new Date(log.date), 'EEE, MMM d')}</Text>
              <div style={{ marginTop: 4 }}>
                {log.shadowingDone && <Tag icon={<PlayCircleOutlined />} color="blue">Shadowing {log.shadowingMinutes}m</Tag>}
                {log.voiceNoteDone && <Tag icon={<AudioOutlined />} color="purple">Voice Note</Tag>}
                {log.coffeeChatDone && <Tag icon={<CoffeeOutlined />} color="orange">Conversation</Tag>}
                {log.notes && <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{log.notes}</Text>}
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No activity yet. Start logging!' }}
      />
    </Card>
  );
}
