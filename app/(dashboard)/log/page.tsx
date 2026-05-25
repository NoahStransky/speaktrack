'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Checkbox,
  InputNumber,
  Slider,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Space,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const energyMarks: Record<number, string> = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export default function DailyLogPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shadowingDone, setShadowingDone] = useState(false);
  const [shadowingMinutes, setShadowingMinutes] = useState(0);
  const [voiceNoteDone, setVoiceNoteDone] = useState(false);
  const [coffeeChatDone, setCoffeeChatDone] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchToday() {
      setLoading(true);
      try {
        const res = await fetch('/api/logs/today');
        const data = await res.json();
        if (data) {
          setShadowingDone(data.shadowingDone);
          setShadowingMinutes(data.shadowingMinutes);
          setVoiceNoteDone(data.voiceNoteDone);
          setCoffeeChatDone(data.coffeeChatDone);
          setEnergyLevel(data.energyLevel);
          setNotes(data.notes);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchToday();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shadowingDone,
          shadowingMinutes,
          voiceNoteDone,
          coffeeChatDone,
          energyLevel,
          notes,
        }),
      });
      if (res.ok) {
        message.success('Log saved!');
      } else {
        message.error('Failed to save log');
      }
    } catch {
      message.error('Failed to save log');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Title level={2}>Daily Log</Title>

      <Card loading={loading} style={{ marginBottom: 24 }}>
        <Title level={4}>Today&apos;s Habits</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox
            checked={shadowingDone}
            onChange={(e) => setShadowingDone(e.target.checked)}
          >
            Shadowing Practice
          </Checkbox>

          {shadowingDone && (
            <div style={{ marginLeft: 24 }}>
              <span style={{ marginRight: 8 }}>Minutes:</span>
              <InputNumber
                min={0}
                max={300}
                value={shadowingMinutes}
                onChange={(v) => setShadowingMinutes(v ?? 0)}
                style={{ width: 100 }}
              />
            </div>
          )}

          <Checkbox
            checked={voiceNoteDone}
            onChange={(e) => setVoiceNoteDone(e.target.checked)}
          >
            Voice Note Recorded
          </Checkbox>

          <Checkbox
            checked={coffeeChatDone}
            onChange={(e) => setCoffeeChatDone(e.target.checked)}
          >
            Coffee Chat
          </Checkbox>
        </Space>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Energy Level</Title>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Slider
              min={1}
              max={5}
              value={energyLevel}
              onChange={setEnergyLevel}
              marks={energyMarks}
              step={1}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Notes</Title>
        <TextArea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did today go? Any reflections..."
        />
      </Card>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={handleSave}
        loading={saving}
        size="large"
      >
        Save Log
      </Button>
    </div>
  );
}
