import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Landing page', () => {
  it('renders the SpeakTrack title', () => {
    render(<Home />);
    expect(screen.getByText('SpeakTrack')).toBeInTheDocument();
  });

  it('renders the "Get Started Free" button linking to /register', () => {
    render(<Home />);
    const btn = screen.getByRole('link', { name: /get started free/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/register');
  });

  it('renders the "Sign In" button linking to /login', () => {
    render(<Home />);
    const btn = screen.getByRole('link', { name: /sign in/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/login');
  });
});
