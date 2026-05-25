'use client';

import { Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';

export default function UserMenu() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'User';

  const items = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: () => signOut({ callbackUrl: '/login' }),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Space style={{ cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <span>{userName}</span>
      </Space>
    </Dropdown>
  );
}
