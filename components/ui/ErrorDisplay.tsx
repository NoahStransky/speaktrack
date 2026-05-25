'use client';

import { Button, Result } from 'antd';

export default function ErrorDisplay({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={error.message || 'An unexpected error occurred'}
      extra={<Button type="primary" onClick={reset}>Try Again</Button>}
    />
  );
}
