'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  EditOutlined,
  AudioOutlined,
  BookOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/log',
    icon: <EditOutlined />,
    label: 'Daily Log',
  },
  {
    key: '/voice',
    icon: <AudioOutlined />,
    label: 'Voice Notes',
  },
  {
    key: '/resources',
    icon: <BookOutlined />,
    label: 'Resources',
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = menuItems.find((item) => pathname.startsWith(item.key))?.key || '/dashboard';

  return (
    <Sider
      width={220}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>
          SpeakTrack
        </span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
}
