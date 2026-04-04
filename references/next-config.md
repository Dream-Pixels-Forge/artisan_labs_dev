# Next.js Configuration Reference

Complete reference for next.config.ts optimization for Vercel deployments.

## Basic Configuration

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
```

## Output Modes

### Default (Auto)

```ts
const nextConfig: NextConfig = {
  // No output specified - Vercel auto-detects
};
```

### Standalone (Recommended for Vercel)

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  // Reduces bundle size by ~70%
  // Only includes necessary files
};
```

### Static Export

```ts
const nextConfig: NextConfig = {
  output: "export",
  // Static HTML only - no server-side features
  // Use for: landing pages, blogs, docs
};
```

## Image Optimization

```ts
const nextConfig: NextConfig = {
  images: {
    // Image formats
    formats: ['image/avif', 'image/webp'],
    
    // Remote patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
    
    // Allowed domains
    domains: ['example.com', 'images.example.com'],
    
    // Cache TTL (seconds)
    minimumCacheTTL: 31536000, // 1 year
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    
    // Image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## TypeScript & ESLint

```ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fail build on TS errors
    ignoreDuringBuilds: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false, // Fail build on ESLint errors
    dirs: ['src', 'app'], // Lint specific directories
  },
};
```

## Transpilation

```ts
const nextConfig: NextConfig = {
  transpilePackages: [
    // Packages to transpile
    'shadcn-ui',
    'framer-motion',
    'lucide-react',
  ],
  
  excludeDefaultMomentLocales: true,
};
```

## Webpack Configuration

```ts
const nextConfig: NextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack plugins
    config.plugins.push(new MyCustomPlugin());
    
    // Handle specific file types
    config.module.rules.push({
      test: /\.my-extension$/,
      use: [defaultLoaders.babel],
    });
    
    return config;
  },
};
```

## Rewrites

```ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-old/:path*',
        destination: '/api/new/:path*',
      },
      {
        source: '/old-page',
        destination: '/new-page',
      },
      {
        source: '/external/:path*',
        destination: 'https://external-api.com/:path*',
      },
    ];
  },
};
```

## Redirects

```ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 308 redirect
      },
      {
        source: '/temporary',
        destination: '/other',
        permanent: false, // 307 redirect
      },
      {
        source: '/blog/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
    ];
  },
};
```

## Headers

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};
```

## Experimental Features

```ts
const nextConfig: NextConfig = {
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    
    // Optimize package imports
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-*',
    ],
    
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    
    // Turbopack (faster builds)
    // Note: Currently only in canary
    // turbo: {},
  },
};
```

## Complete Example

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output
  output: "standalone",
  
  // React
  reactStrictMode: true,
  
  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  
  // TypeScript & ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Transpile packages
  transpilePackages: ['shadcn-ui', 'framer-motion'],
  
  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/legacy/:slug',
        destination: '/new/:slug',
        permanent: true,
      },
    ];
  },
  
  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'https://api.external.com/:path*',
      },
    ];
  },
  
  // Experimental
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
```

## Vercel-Specific Optimizations

```ts
const nextConfig: NextConfig = {
  // Enable ISR
  // Already handled via route config
  
  // Compression (automatic on Vercel)
  // compress: true,
  
  // Generate Etags (automatic on Vercel)
  // generateEtags: true,
  
  // Powered by header (remove for custom)
  // poweredByHeader: false,
  
  // Static page prefix
  // staticPageGenerator: 'next-page-generator',
  
  // Amp
  // amp: { hybrid: true },
};
```

## Bundle Analyzer

```ts
const nextConfig: NextConfig = {
  // Bundle analyzer (use with ANALYZE=true)
};

// Add at the end of config
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

## Environment Variables in Config

```ts
const nextConfig: NextConfig = {
  // Use env vars in config
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

## References

- [Next.js Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Output Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Image Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/images)
