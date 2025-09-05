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
  basePath: '/agentmanagement-test',
  assetPrefix: '/agentmanagement-test', // Add this line
  output: 'export',
  trailingSlash: true,
}

export default nextConfig