import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from 'antd';

describe('Ant Design integration', () => {
  it('renders a primary button with correct Ant Design class', () => {
    render(<Button type="primary">Hello SpeakTrack</Button>);

    const button = screen.getByRole('button', { name: /hello speaktrack/i });
    expect(button).toBeInTheDocument();
    // Ant Design primary button should have ant-btn-primary class
    expect(button.className).toContain('ant-btn');
    expect(button.className).toContain('ant-btn-primary');
  });

  it('renders Ant Design Typography component', () => {
    const { Typography } = require('antd');
    render(<Typography.Title level={1}>Test Title</Typography.Title>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Title');
  });
});
