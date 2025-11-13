import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/unrar-browser-wasm/nextjs-demo',
  assetPrefix: '/unrar-browser-wasm/nextjs-demo',
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 支持 WASM 文件
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // 在客户端构建时，排除 Node.js 核心模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
      }
    }

    return config
  },
}

export default nextConfig

