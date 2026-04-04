# vercel.json Complete Reference

Complete schema and configuration options for vercel.json.

## Schema

```json
{
  "$schema": "https://openapi.vercel.com/schemas/vercel.json",
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  
  "env": {},
  "headers": [],
  "routes": [],
  "crons": [],
  "functions": {},
  "images": {}
}
```

## Framework Detection

| Framework | Value | Auto-Detected |
|-----------|-------|---------------|
| Next.js | `nextjs` | Yes |
| React | `create-react-app` | Yes |
| Vue | `vue` | Yes |
| Svelte | `svelte` | Yes |
| Nuxt | `nuxt` | Yes |
| Gatsby | `gatsby` | Yes |
| Astro | `astro` | Yes |
| Next.js | `blitz` | Yes |

## Build Settings

### Basic Configuration

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next"
}
```

### Package Manager Options

| Manager | Install Command |
|---------|-----------------|
| Bun | `bun install` |
| Bun (frozen lock) | `bun install --frozen-lockfile` |
| npm | `npm install` |
| npm (ci) | `npm ci` |
| yarn | `yarn install` |
| pnpm | `pnpm install` |

## Regions

```json
{
  "regions": ["iad1"]
}
```

### Available Regions

| Region Code | Location |
|-------------|----------|
| `iad1` | US East (Virginia) |
| `sfo1` | US West (California) |
| `sfo2` | US West (Oregon) |
| `fra1` | Europe (Frankfurt) |
| `lhr1` | Europe (London) |
| `hnd1` | Asia Pacific (Tokyo) |
| `sgp1` | Asia Pacific (Singapore) |
| `syd1` | Australia (Sydney) |
| `grp1` | South America (São Paulo) |

## Environment Variables

```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "API_KEY": "@api-key",
    "NEXT_PUBLIC_APP_URL": "@next-public-app-url",
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  }
}
```

### Variable Prefixes

| Prefix | Description |
|--------|-------------|
| `@` | Reference Vercel project variable |
| `@env` | Reference system environment variable |
| `@project` | Reference project-wide secret |

## Headers Configuration

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
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Routes Configuration

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": { "Cache-Control": "no-store, max-age=0" }
    },
    {
      "src": "/_next/static/(.*)",
      "headers": { "Cache-Control": "public, max-age=31536000, immutable" }
    },
    {
      "src": "/(.*)\\.(jpg|jpeg|png|gif|webp|avif)$",
      "headers": { "Cache-Control": "public, max-age=86400" }
    },
    {
      "src": "/(.*)\\.(svg|css|js|woff|woff2|ttf|eot)$",
      "headers": { "Cache-Control": "public, max-age=86400" }
    }
  ]
}
```

## Functions Configuration

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge",
      "maxDuration": 30,
      "memory": 1024
    },
    "api/v1/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

### Runtime Options

| Runtime | Use Case |
|---------|----------|
| `edge` | Low latency, simple computations |
| `nodejs18.x` | Full Node.js features |
| `nodejs20.x` | Node.js 20 LTS |

### Function Limits

| Setting | Default | Maximum |
|---------|---------|---------|
| `maxDuration` | 10s | 300s (Pro) / 900s (Enterprise) |
| `memory` | 1024MB | 3008MB |

## Image Optimization

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
        "hostname": "**.cloudfront.net",
        "pathname": "/**"
      },
      {
        "protocol": "https",
        "hostname": "**.amazonaws.com",
        "pathname": "/**"
      }
    ]
  }
}
```

### Image Options

| Option | Type | Description |
|--------|------|-------------|
| `sizes` | number[] | Responsive image sizes |
| `formats` | string[] | Image formats (avif, webp) |
| `minimumCacheTTL` | number | Cache duration in seconds |
| `domains` | string[] | Allowed image domains |
| `remotePatterns` | object[] | Remote pattern configuration |

## Cron Jobs

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/sync",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
* * * * *
```

### Common Schedules

| Schedule | Frequency |
|----------|-----------|
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Daily at midnight |
| `0 0 * * 0` | Weekly on Sunday |
| `0 0 1 * *` | Monthly on 1st |

## Complete Example

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
      "headers": { "Cache-Control": "no-store" }
    }
  ],
  
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge",
      "maxDuration": 30
    }
  },
  
  "images": {
    "formats": ["image/avif", "image/webp"],
    "minimumCacheTTL": 31536000
  },
  
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## References

- [Vercel vercel.json Documentation](https://vercel.com/docs/project-configuration/vercel-json)
- [Build Output API](https://vercel.com/docs/build-output-api/configuration)
