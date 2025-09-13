/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

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
  // Use basePath/assetPrefix only when provided (e.g., production export hosting)
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  output: 'export',
  trailingSlash: true,
}

export default nextConfig