---
name: vercel-deploy-master
description: Expert guidance for deploying Next.js applications to Vercel with production-ready configurations, environment variables, and optimization best practices. Use this skill when deploying to Vercel, configuring vercel.json, setting up environment variables, optimizing build settings, or troubleshooting deployment issues.
license: Apache-2.0
metadata:
  author: Dream-Pixels-Forge
  version: 1.0.0
  triggers: [vercel deployment, deploy to vercel, vercel.json, vercel config, vercel env, vercel production, vercel build settings, next.js vercel, vercel troubleshooting]
---

# Vercel Deploy Master

Comprehensive guide for deploying Next.js applications to Vercel with production-ready configurations, environment variables, and optimization best practices.

## When to Use This Skill

Use this skill when:
- Deploying Next.js applications to Vercel
- Configuring vercel.json for custom settings
- Setting up environment variables and secrets
- Optimizing build settings and performance
- Troubleshooting deployment issues
- Configuring security headers
- Setting up ISR, SSR, or Edge Functions
- Adding analytics and monitoring
- Automating deployment workflows

---

## Quick Start

### 1. Connect Your Repository

```
Vercel Dashboard → Add Project → Import GitHub repo
```

### 2. Configuration Files

This skill includes ready-to-use configurations:

| File | Purpose |
|------|---------|
| `references/vercel-json.md` | Complete vercel.json schema |
| `references/next-config.md` | Next.js config optimization |
| `references/env-setup.md` | Environment variables guide |
| `references/security-headers.md` | Security headers configuration |
| `references/analytics.md` | Vercel Analytics setup |
| `references/deploy-automation.md` | GitHub Actions CI/CD |
| `references/troubleshooting.md` | Common issues and fixes |

### 3. Auto-Deploy Setup

See `references/deploy-automation.md` for automated deployments via GitHub Actions.

---

## 1. Project Configuration

### vercel.json Schema

```json
{
  "$schema": "https://openapi.vercel.com/schemas/vercel.json",
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  
  "env": {
    "NEXT_PUBLIC_APP_URL": "@next-public-app-url"
  },
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": { "Cache-Control": "no-cache" }
    }
  ],
  
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge",
      "maxDuration": 30
    }
  },
  
  "images": {
    "domains": ["example.com"],
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "**.cloudfront.net"
      }
    ]
  }
}
```

### Key Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `framework` | string | Auto-detect framework (nextjs, react, etc.) |
| `buildCommand` | string | Custom build command |
| `installCommand` | string | Package manager install command |
| `outputDirectory` | string | Build output directory |
| `regions` | string[] | Serverless function regions |
| `env` | object | Environment variables |
| `headers` | object[] | Custom headers |
| `routes` | object[] | Custom routing rules |

---

## 2. Build Settings

### Recommended Settings for Next.js

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next"
}
```

### Using Different Package Managers

| Manager | Install Command | Build Command |
|---------|-----------------|---------------|
| Bun | `bun install` | `bun run build` |
| npm | `npm install` | `npm run build` |
| yarn | `yarn install` | `yarn build` |
| pnpm | `pnpm install` | `pnpm build` |

---

## 3. Environment Variables

### Setting Environment Variables

**Via Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add variables for Production, Preview, Development
3. Use `@` prefix to reference secrets

**Via vercel.json:**
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  }
}
```

See `references/env-setup.md` for detailed environment variable configuration.

### System Environment Variables

Vercel provides built-in variables:

| Variable | Description |
|----------|-------------|
| `VERCEL` | Always `true` |
| `VERCEL_URL` | Deployment URL |
| `VERCEL_BRANCH` | Git branch deployed |
| `VERCEL_COMMIT_SHA` | Git commit SHA |
| `VERCEL_DEPLOYMENT_ID` | Unique deployment ID |

### Exposing to Browser

To expose env vars to the browser, prefix with `NEXT_PUBLIC_`:

```env
# Server-side only
DATABASE_URL="postgresql://..."

# Client-side (browser)
NEXT_PUBLIC_APP_URL="https://app.vercel.app"
```

---

## 4. Rendering Strategies

### Static Site Generation (SSG)

Default for pages without dynamic data. No special config needed.

### Incremental Static Regeneration (ISR)

```tsx
export const revalidate = 60 // Revalidate every 60 seconds
```

### Server-Side Rendering (SSR)

```tsx
export const dynamic = 'force-dynamic'
```

### Edge Functions

```tsx
export const runtime = 'edge'
```

---

## 5. Security Best Practices

See `references/security-headers.md` for complete security configuration.

### Security Headers

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### Environment Variable Security

1. **Never commit secrets** - Use Vercel project settings
2. **Use `@` prefix** - Reference secrets securely
3. **Restrict access** - Limit which environments can access secrets
4. **Rotate secrets** - Regularly update API keys

---

## 6. Analytics & Monitoring

See `references/analytics.md` for complete analytics setup.

### Vercel Analytics

Add to your layout:

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Install:
```bash
bun add @vercel/analytics
```

### Speed Insights

```tsx
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

Install:
```bash
bun add @vercel/speed-insights
```

### Web Vitals Monitoring

Vercel automatically collects Core Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)

---

## 7. Automated Deployments

See `references/deploy-automation.md` for GitHub Actions setup.

### GitHub Actions Workflow

```yaml
name: Vercel Production Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
          
      - name: Install Dependencies
        run: bun install
        
      - name: Type Check
        run: bun run type-check
        
      - name: Build
        run: bun run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Pull environment variables
vercel env pull .env.local
```

---

## 8. Troubleshooting

See `references/troubleshooting.md` for detailed troubleshooting.

### Common Deployment Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check `bun run build` locally first |
| 404 on refresh | Ensure rewrites handle client-side routing |
| Env vars missing | Check dashboard settings |
| Function timeout | Increase `maxDuration` |
| Memory exceeded | Optimize imports, lazy load |

### Debugging Build Errors

```bash
# Run build locally
bun run build
```

### Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `FUN_001` | Function timeout | Increase maxDuration |
| `FUN_002` | Memory limit | Optimize bundle size |
| `BUILD_001` | Build command failed | Check local build |
| `DEPLOY_001` | Deploy limit | Upgrade plan |

---

## 9. Next.js Configuration

See `references/next-config.md` for complete Next.js config.

### Recommended next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
```

---

## 10. Performance Optimization

### Image Optimization

```json
{
  "images": {
    "sizes": [640, 750, 828, 1080, 1200, 1920, 2048],
    "formats": ["image/avif", "image/webp"],
    "minimumCacheTTL": 31536000
  }
}
```

### Bundle Analysis

```bash
bun add -D @next/bundle-analyzer
```

```ts
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run: `ANALYZE=true bun run build`

---

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [vercel.json Schema](https://vercel.com/docs/project-configuration/vercel-json)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## Related Skills

- `vercel-react-best-practices` - React/Next.js performance optimization
- `vercel-composition-patterns` - React composition patterns
- `nextjs` - Next.js development guidance
