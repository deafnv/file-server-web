/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/files',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
