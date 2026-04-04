# Vercel Deploy Master - Skill Files

This skill provides comprehensive guidance for deploying Next.js applications to Vercel.

## Files Structure

```
vercel-deploy-master/
├── SKILL.md                    # Main skill file
├── references/
│   ├── vercel-json.md          # Complete vercel.json schema
│   ├── next-config.md         # Next.js configuration
│   ├── env-setup.md           # Environment variables guide
│   ├── security-headers.md    # Security headers configuration
│   ├── analytics.md           # Vercel Analytics & Speed Insights
│   ├── deploy-automation.md   # GitHub Actions CI/CD workflows
│   └── troubleshooting.md     # Common issues and solutions
```

## Quick Usage

### 1. Project Setup

Reference: `references/vercel-json.md`

Create `vercel.json` in project root:

```json
{
  "$schema": "https://openapi.vercel.com/schemas/vercel.json",
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next"
}
```

### 2. Next.js Configuration

Reference: `references/next-config.md`

Update `next.config.ts`:

```ts
const nextConfig = {
  output: "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

### 3. Environment Variables

Reference: `references/env-setup.md`

Add to Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://...
```

### 4. Security Headers

Reference: `references/security-headers.md`

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 5. Analytics Setup

Reference: `references/analytics.md`

```bash
bun add @vercel/analytics @vercel/speed-insights
```

Add to `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 6. Automated Deployments

Reference: `references/deploy-automation.md`

Create `.github/workflows/vercel.yml`:

```yaml
name: Vercel Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 7. Troubleshooting

Reference: `references/troubleshooting.md`

Common fixes:
- Build fails → Run `bun run build` locally
- 404 on refresh → Check routing in vercel.json
- Env vars missing → Verify in dashboard

## Skills Author

- **Author:** Dream-Pixels-Forge
- **License:** Apache 2.0
- **Version:** 1.0.0
