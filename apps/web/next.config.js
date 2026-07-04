import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@atomic-ai/ui', '@atomic-ai/utils', '@atomic-ai/types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

export default config;
