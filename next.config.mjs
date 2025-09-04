/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['use-client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['prime.rw'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://apps.prime.rw/agentmanagementbackend/api/:path*",
      },
    ];
  },
}

export default nextConfig
