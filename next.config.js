const { withPayload } = require('@payloadcms/next/withPayload');

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Allow cross-origin requests from specific IPs during development
  allowedDevOrigins: [
    '192.168.0.75',
    '*.local',
    'localhost',
  ],
};

module.exports = withPayload(nextConfig);