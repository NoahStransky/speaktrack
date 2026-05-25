'use client';

import { Form, Input, Select, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string; name: string; nativeLanguage?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || 'Registration failed');
        return;
      }

      message.success('Registration successful! Please log in.');
      router.push('/login');
    } catch {
      message.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
        Create Account
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        Sign up to start tracking your speaking practice
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Your name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="you@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="At least 6 characters"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Native Language"
          name="nativeLanguage"
          initialValue="en"
        >
          <Select
            options={languageOptions}
            size="large"
            placeholder="Select your native language"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Register
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1677ff' }}>
            Log in
          </Link>
        </Text>
      </div>
    </div>
  );
}
