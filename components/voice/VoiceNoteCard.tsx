'use client';

import { Card, Rate, Button, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Text, Paragraph } = Typography;

type VoiceNote = { id: string; filePath: string; selfRating: number; notes: string; createdAt: string };

export default function VoiceNoteCard({ note, onDelete }: { note: VoiceNote; onDelete: (id: string) => void }) {
  return (
    <Card size="small" style={{ marginBottom: 16 }}
      title={<span><PlayCircleOutlined style={{ marginRight: 8 }} />{format(new Date(note.createdAt), 'MMM d, yyyy — h:mm a')}</span>}
      extra={<Popconfirm title="Delete this note?" onConfirm={() => onDelete(note.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>}>
      <audio controls src={note.filePath} style={{ width: '100%', marginBottom: 12 }} />
      <div><Text type="secondary">Self-rating: </Text><Rate disabled value={note.selfRating} style={{ fontSize: 16 }} /></div>
      {note.notes && <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 13 }}>{note.notes}</Paragraph>}
    </Card>
  );
}
