# Analytics Setup Guide

Complete guide to setting up analytics and monitoring for Vercel Next.js applications.

## Vercel Analytics

### Installation

```bash
bun add @vercel/analytics
```

### Basic Setup

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Configuration

```tsx
import { Analytics } from '@vercel/analytics/react'

<Analytics 
  debug={true}  // Enable debug mode in development
  endpoint="/api/analytics"  // Custom endpoint
/>
```

## Vercel Speed Insights

### Installation

```bash
bun add @vercel/speed-insights
```

### Basic Setup

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### With Custom Configuration

```tsx
import { SpeedInsights } from '@vercel/speed-insights/react'

<SpeedInsights 
  debug={true}
  endpoint="/api/speed-insights"
  sampleRate={100}  // Percentage of users to track (1-100)
/>
```

## Complete Layout Example

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'My amazing app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Web Vitals

### Core Web Vitals Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| INP | < 200ms | 200ms - 500ms | > 500ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Custom Web Vitals Tracking

```tsx
'use client'

import { useWebVitals } from '@vercel/analytics/react'

export function WebVitals() {
  useWebVitals((metric) => {
    console.log('Web Vitals:', metric)
    
    // Send to analytics service
    sendToAnalytics(metric.name, metric.value, metric.id)
  })
  
  return null
}
```

## Google Analytics (Optional)

### Installation

```bash
bun add @phntms/next-google-analytics
# or
bun add @vercel/analytics
```

### Next.js Integration

```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@phntms/next-google-analytics'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaMeasurementId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

### Using Vercel Analytics Instead

Vercel Analytics is simpler and built-in:

```tsx
import { Analytics } from '@vercel/analytics/react'
```

No additional setup required - it works automatically.

## Custom Analytics Events

### Track Custom Events

```tsx
'use client'

import { Analytics } from '@vercel/analytics/react'

export function trackEvent(name: string, properties?: Record<string, any>) {
  Analytics.track(name, properties)
}

// Usage
<button onClick={() => trackEvent('button_clicked', { button: 'cta' })}>
  Click Me
</button>
```

### Track Page Views

```tsx
'use client'

import { Analytics } from '@vercel/analytics/react'

// Automatically tracked, but can track manually
Analytics.pageview('/path')
```

## Monitoring with Sentry

### Installation

```bash
bun add @sentry/nextjs
```

### Setup

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.automaticServerSideInstrumentation(),
  ],
  // Performance monitoring
  tracesSampleRate: 1.0,
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Environment Variables

```env
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
```

## Health Checks

### API Health Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

### Database Health Check

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    }, { status: 503 })
  }
}
```

## Deployment Health

### Vercel Deployment Status

Vercel automatically provides:
- Deployment status (ready, error, ready)
- Function invocation logs
- Edge function status
- Build logs

### Custom Health Check Script

```bash
#!/bin/bash
# health-check.sh

URL="$1"
EXPECTED_STATUS=200

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS" -eq "$EXPECTED_STATUS" ]; then
  echo "Health check passed"
  exit 0
else
  echo "Health check failed: $STATUS"
  exit 1
fi
```

## Dashboard Overview

### Vercel Dashboard Metrics

| Section | Metrics |
|---------|---------|
| Analytics | Page views, unique visitors, top pages |
| Speed Insights | LCP, FID, CLS, INP |
| Function Invocations | Count, duration, errors |
| Bandwidth | Total, cached, origin |
| Database (if used) | Connections, queries |

### Custom Dashboards

Create custom dashboards with:
1. **Vercel Analytics** - Built-in page analytics
2. **Grafana** - Custom metrics visualization
3. **Datadog** - Full-stack monitoring
4. **Checkly** - Uptime monitoring

## Environment-Specific Configuration

### Development (Disable Analytics)

```tsx
// app/components/Analytics.tsx
'use client'

import { Analytics } from '@vercel/analytics/react'

export function AnalyticsWrapper({ children }) {
  if (process.env.NODE_ENV === 'development') {
    return children
  }
  
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
```

### Preview (Reduced Sampling)

```tsx
<Analytics sampleRate={process.env.VERCEL_ENV === 'preview' ? 10 : 100} />
```

## Performance Optimization Tips

### 1. Lazy Load Analytics

```tsx
// Delay analytics loading
useEffect(() => {
  const timer = setTimeout(() => {
    import('@vercel/analytics').then(({ Analytics }) => {
      // Initialize
    })
  }, 2000)
  
  return () => clearTimeout(timer)
}, [])
```

### 2. Use Edge Functions

```tsx
// Run analytics at edge for faster response
export const runtime = 'edge'
```

### 3. Batch Events

```tsx
// Batch events to reduce network calls
const events = []
function queueEvent(event) {
  events.push(event)
  if (events.length >= 10) {
    flushEvents()
  }
}
```

## Migration Checklist

- [ ] Install `@vercel/analytics`
- [ ] Add to `app/layout.tsx`
- [ ] Install `@vercel/speed-insights`
- [ ] Add to `app/layout.tsx`
- [ ] Configure sample rates
- [ ] Set up custom events (if needed)
- [ ] Add health check endpoint
- [ ] Test in development
- [ ] Verify in production dashboard

## References

- [Vercel Analytics Docs](https://vercel.com/docs/concepts/analytics)
- [Speed Insights Docs](https://vercel.com/docs/concepts/speed-insights)
- [Web Vitals](https://web.dev/vitals/)
