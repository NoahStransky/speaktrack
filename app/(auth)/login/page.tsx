'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        message.error('Invalid email or password');
      }
    } catch {
      message.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        SpeakTrack Login
      </Title>

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        autoComplete="off"
      >
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
            placeholder="Email"
            type="email"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Log In
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        Don&apos;t have an account?{' '}
        <Link href="/register">Register</Link>
      </div>
    </div>
  );
}
