'use client';

import { Card, Tag, Button, Popconfirm, Typography, Space } from 'antd';
import { LinkOutlined, FileTextOutlined, PlayCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

type Resource = { id: string; type: string; title: string; url: string; content: string; tags: string };

const typeIcons: Record<string, React.ReactNode> = { link: <LinkOutlined />, phrase: <FileTextOutlined />, shadowing: <PlayCircleOutlined /> };
const typeColors: Record<string, string> = { link: 'blue', phrase: 'green', shadowing: 'purple' };

export default function ResourceCard({ resource, onDelete, onEdit }: {
  resource: Resource; onDelete: (id: string) => void; onEdit: (r: Resource) => void;
}) {
  return (
    <Card size="small" style={{ marginBottom: 12 }}
      title={<Space><Tag color={typeColors[resource.type] || 'default'} icon={typeIcons[resource.type]}>{resource.type}</Tag><Text strong>{resource.title}</Text></Space>}
      extra={<Space><Button size="small" icon={<EditOutlined />} onClick={() => onEdit(resource)} /><Popconfirm title="Delete?" onConfirm={() => onDelete(resource.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>}>
      {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 8 }}>{resource.url}</a>}
      {resource.content && <Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>{resource.content}</Paragraph>}
      {resource.tags && <div>{resource.tags.split(',').map((tag) => <Tag key={tag} style={{ marginBottom: 4 }}>{tag.trim()}</Tag>)}</div>}
    </Card>
  );
}
