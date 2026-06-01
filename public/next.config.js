/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // ← Set false untuk aktif di development
  workboxOptions: {
    disableDevLogs: false,
  }
});

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
