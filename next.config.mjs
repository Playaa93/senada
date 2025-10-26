import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/offline", revision: null },
    { url: "/icons/icon-192x192.png", revision: null },
    { url: "/icons/icon-512x512.png", revision: null },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for Next.js 16
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '2mb',
  //   },
  // },

  // PWA Configuration
  // Note: Use Serwist for PWA support
  // headers() not supported with static export

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image Optimization
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compiler Options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Production Source Maps
  productionBrowserSourceMaps: false,

  // Turbopack configuration
  turbopack: {},

  // Webpack configuration (if needed alongside Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Custom webpack configurations can be added here
    return config;
  },

  // Environment Variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Senada',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // Output Configuration
  // output: 'standalone', // Commented out - using default for now

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withSerwist(nextConfig);
