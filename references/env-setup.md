# Environment Variables Setup Guide

Complete guide for managing environment variables in Vercel Next.js deployments.

## Environment Types

Vercel supports three environments:

| Environment | When Active | Use Case |
|-------------|-------------|----------|
| Production | Production deployments | Live app |
| Preview | PR/branch deployments | Testing |
| Development | Local development | `vercel dev` |

## Setting Environment Variables

### Via Vercel Dashboard

1. Go to **Project Settings** → **Environment Variables**
2. Click **Add New**
3. Enter key and value
4. Select environments (Production, Preview, Development)
5. Click **Save**

### Via vercel.json

```json
{
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  }
}
```

### Via CLI

```bash
# Add environment variable
vercel env add DATABASE_URL production

# List environment variables
vercel env list production

# Pull to local .env
vercel env pull .env.local
```

## Variable Types

### Server-Side Only

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
API_KEY="sk-xxxxxxxxxxxxx"
SECRET_KEY="your-secret-key"
```

**Usage:**
```ts
// Only accessible server-side
const db = new Database(process.env.DATABASE_URL)
```

### Client-Side (Public)

```env
NEXT_PUBLIC_APP_URL="https://app.vercel.app"
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

**Usage:**
```tsx
// Accessible in both server and client
export function MyComponent() {
  const url = process.env.NEXT_PUBLIC_APP_URL
  return <div>{url}</div>
}
```

## System Environment Variables

Vercel automatically provides:

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL` | Always `true` | `true` |
| `VERCEL_URL` | Deployment URL | `my-app.vercel.app` |
| `VERCEL_BRANCH` | Git branch | `main` |
| `VERCEL_COMMIT_SHA` | Commit SHA | `abc123...` |
| `VERCEL_DEPLOYMENT_ID` | Deployment ID | `dpl_xxx` |
| `VERCEL_REGION` | Deployment region | `iad1` |

## Referencing Secrets

### Using @ Prefix

Reference existing secrets in vercel.json:

```json
{
  "env": {
    "DATABASE_URL": "@database-url-secret",
    "API_KEY": "@api-key-secret"
  }
}
```

### Creating Secrets

1. Go to **Project Settings** → **Environment Variables**
2. Add variable
3. Check **Encrypt** (for sensitive values)
4. Reference with `@` prefix

## Environment-Specific Configuration

### Different Values per Environment

```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "API_URL": {
      "production": "https://api.production.com",
      "preview": "https://api.staging.com",
      "development": "http://localhost:3000"
    }
  }
}
```

### Conditional via Code

```ts
// Get environment-specific API URL
const getApiUrl = () => {
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://api.production.com'
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return 'https://api.staging.com'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}

const apiUrl = getApiUrl()
```

## .env Files

### .env.local (Development)

```env
# Local development only
DATABASE_URL="postgresql://localhost:5432/dev_db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### .env.production

```env
# Production values (never commit!)
DATABASE_URL="postgresql://prod-host:5432/prod_db"
API_KEY="sk-prod-xxxxx"
```

### .env.example

```env
# Template for team members
DATABASE_URL="postgresql://user:password@host:5432/db"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
.env
.env.local
.env.production
*.local
```

### 2. Use Encryption

For sensitive values, use Vercel's encryption:

1. Add variable in dashboard
2. Enable **Encrypt** option
3. Value is encrypted at rest

### 3. Restrict Access

```json
{
  "env": {
    "DATABASE_URL": {
      "production": "@db-prod",
      "preview": "@db-staging"
    }
  }
}
```

### 4. Use Different Secrets per Environment

```env
# Production
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host/prod-db"

# Preview/Staging  
DATABASE_URL="postgresql://staging-user:staging-pass@staging-host/staging-db"
```

## Common Variables for Next.js

```env
# Required for production
NEXT_PUBLIC_APP_URL="https://app-name.vercel.app"

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://app-name.vercel.app"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# APIs
NEXT_PUBLIC_API_URL="https://api.example.com"
API_KEY="sk-..."

# Feature Flags
NEXT_PUBLIC_ENABLE_NEW_FEATURE="true"
```

## TypeScript Typing

```ts
// src/types/env.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

interface EnvironmentVariables {
  // Server-side
  DATABASE_URL: string
  API_KEY: string
  
  // Client-side
  NEXT_PUBLIC_APP_URL: string
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_GA_ID: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}
```

## Migration Checklist

- [ ] Create `.env.example` template
- [ ] Add all required variables to Vercel dashboard
- [ ] Enable encryption for sensitive values
- [ ] Set correct environment scopes
- [ ] Test with `vercel env pull`
- [ ] Update team on required variables
- [ ] Set up secret rotation schedule

## References

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [System Environment Variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables)
