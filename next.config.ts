import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry', 'rc-util', 'rc-pagination', 'rc-picker'],
};

export default nextConfig;
