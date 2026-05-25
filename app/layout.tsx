import type { Metadata } from 'next';
import AntdProvider from '@/lib/antd-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakTrack — Improve Your English Speaking',
  description: 'Track speaking practice, voice notes, and resources',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
