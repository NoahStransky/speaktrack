import { SessionProvider } from 'next-auth/react';
import { Layout } from 'antd';
import AppSidebar from '@/components/layout/AppSidebar';
import UserMenu from '@/components/layout/UserMenu';

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <AppSidebar />
        <Layout style={{ marginLeft: 220 }}>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <UserMenu />
          </Header>
          <Content style={{ padding: 24, background: '#f5f5f5' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </SessionProvider>
  );
}
