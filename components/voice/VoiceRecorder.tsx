'use client';

import { useState, useRef } from 'react';
import { Button, message, Typography, Progress } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function VoiceRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete(blob);
      };

      mediaRecorder.current.start();
      setRecording(true);
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      message.error('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (recording) {
    return (
      <div style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 8 }}><AudioOutlined /></div>
        <Text strong style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{formatTime(elapsed)}</Text>
        <Progress percent={Math.min((elapsed / 120) * 100, 100)} showInfo={false} status="active" />
        <Button danger size="large" icon={<StopOutlined />} onClick={stopRecording} style={{ marginTop: 16 }}>Stop Recording</Button>
      </div>
    );
  }

  return <Button type="primary" size="large" icon={<AudioOutlined />} onClick={startRecording}>Start Recording</Button>;
}
