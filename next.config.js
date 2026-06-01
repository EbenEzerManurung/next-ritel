/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: !isDev,
  skipWaiting: true,
  disable: isDev,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/favicon\.ico$/, /favicon\.png$/, /favicon\.svg$/],
  },
});

const nextConfig = {
  reactStrictMode: true,
  
  // Hapus console.log di production
  compiler: {
    removeConsole: !isDev ? {
      exclude: ['error', 'warn'], // Hanya hapus console.log, console.info, console.debug
    } : false,
  },
  
  // Security headers untuk best practices
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);