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

## 1. Project Configuration

### vercel.json Schema

The `vercel.json` file configures your project at the root directory:

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
  
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/5 * * * *"
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

### Environment Variable Reference

**Variable prefixes:**
- `@` - Reference a Vercel project environment variable
- `@env` - Reference a system environment variable
- `@project` - Reference a project-wide secret

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
// app/blog/[slug]/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug)
  return <article>{post.title}</article>
}
```

**Vercel ISR optimization (2025+):** ISR is now faster and more cost-efficient with Vercel's updated caching infrastructure.

### Server-Side Rendering (SSR)

```tsx
// app/user/page.tsx
export const dynamic = 'force-dynamic'

export default async function UserPage() {
  const user = await fetchUser()
  return <div>{user.name}</div>
}
```

### Edge Functions

```tsx
// app/api/hello/route.ts
export const runtime = 'edge'

export async function GET() {
  return Response.json({ message: 'Hello Edge!' })
}
```

**Edge config in vercel.json:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge",
      "maxDuration": 30
    }
  }
}
```

---

## 5. Security Best Practices

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
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" }
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

### Protecting API Routes

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/protected/:path*'
}
```

---

## 6. Performance Optimization

### Image Optimization

```json
{
  "images": {
    "sizes": [640, 750, 828, 1080, 1200, 1920, 2048],
    "formats": ["image/avif", "image/webp"],
    "minimumCacheTTL": 31536000,
    "domains": ["images.example.com"],
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "**.cdn.example.com"
      }
    ]
  }
}
```

### Caching Strategies

**Static assets:** Long cache with hash (automatic in Next.js)
**API routes:** No cache for dynamic content
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  ]
}
```

### Bundle Analysis

Use `@next/bundle-analyzer`:

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

## 7. Troubleshooting

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

# Check build output
cat .next/output.txt
```

### Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `FUN_001` | Function timeout | Increase maxDuration |
| `FUN_002` | Memory limit | Optimize bundle size |
| `BUILD_001` | Build command failed | Check local build |
| `DEPLOY_001` | Deploy limit | Upgrade plan |

---

## 8. Next.js Configuration

### Recommended next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration
  output: "standalone",
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
  },
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Output Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `export` | Static HTML export | Static sites |
| `standalone` | Optimized for containers | Self-hosting |
| `server` | Server-side rendering | SSR apps |
| default | Auto (SSG + ISR) | Most Next.js apps |

---

## 9. Deployment Workflow

### Step-by-Step Guide

1. **Connect Repository**
   - Vercel Dashboard → Add Project → Import GitHub repo

2. **Configure Project**
   - Framework: Next.js
   - Build Command: bun run build
   - Install Command: bun install
   - Output Directory: .next

3. **Set Environment Variables**
   - Project Settings → Environment Variables
   - Add DATABASE_URL, API_KEYS, etc.

4. **Deploy**
   - Click Deploy → Wait for build → Review URL

5. **Custom Domain (Optional)**
   - Settings → Domains → Add custom domain
   - Configure DNS records

### CLI Deployment

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

## 10. Pro Tips

### Speed Up Builds

- Use `bun` instead of `npm` (2-3x faster)
- Enable Turborepo (default on Pro)
- Use `swc` compiler (automatic in Next.js)

### Reduce Cold Starts

```tsx
// Keep functions warm with cron
export const dynamic = 'force-dynamic'
```

### Monitor Performance

Add `@vercel/analytics/react`:

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

### Enable Preview Deployments

Vercel automatically deploys PRs to preview URLs. Configure branch protection in GitHub for production safety.

---

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [vercel.json Schema](https://vercel.com/docs/project-configuration/vercel-json)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
