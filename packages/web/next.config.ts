import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['docx', 'child_process'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
