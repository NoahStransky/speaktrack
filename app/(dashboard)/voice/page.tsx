'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Select, Input, Button, message, Space, Empty } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import VoiceNoteCard from '@/components/voice/VoiceNoteCard';

const { Title, Text } = Typography;

export default function VoiceNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selfRating, setSelfRating] = useState(3);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/voice');
    setNotes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const uploadRecording = async () => {
    if (!recordedBlob) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'recording.webm');
      formData.append('selfRating', selfRating.toString());
      formData.append('notes', noteText);

      const res = await fetch('/api/voice', { method: 'POST', body: formData });
      if (res.ok) {
        message.success('Voice note saved!');
        setRecordedBlob(null); setNoteText(''); setSelfRating(3);
        fetchNotes();
      } else { message.error('Failed to save'); }
    } catch { message.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/voice/${id}`, { method: 'DELETE' });
    message.success('Deleted');
    fetchNotes();
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={3}>Voice Notes</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Record yourself speaking English. Rate your performance. Track improvement over time.
      </Text>

      <Card title="New Recording" style={{ marginBottom: 24 }}>
        {!recordedBlob ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <VoiceRecorder onRecordingComplete={(blob) => setRecordedBlob(blob)} />
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              Record up to 2 minutes. Describe your day, explain a technical concept, or read a passage.
            </Text>
          </div>
        ) : (
          <div>
            <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%', marginBottom: 16 }} />
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">How would you rate this recording?</Text>
              <div>
                <Select value={selfRating} onChange={setSelfRating} style={{ width: 200 }} size="small">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Select.Option key={n} value={n}>
                      {n === 1 ? '😰 Needs work' : n === 2 ? '😐 Below average' : n === 3 ? '🙂 Okay' : n === 4 ? '😊 Good' : '🔥 Great!'}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <Input.TextArea rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Notes (what did you practice?)" style={{ marginBottom: 12 }} />
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={uploadRecording} loading={saving}>Save Recording</Button>
              <Button onClick={() => setRecordedBlob(null)}>Discard</Button>
            </Space>
          </div>
        )}
      </Card>

      <Title level={4}>Previous Recordings</Title>
      {loading ? <Text>Loading...</Text>
        : notes.length === 0 ? <Empty description="No voice notes yet. Record your first one!" />
        : notes.map((n) => <VoiceNoteCard key={n.id} note={n} onDelete={deleteNote} />)}
    </div>
  );
}
