# Troubleshooting Guide

Common issues and solutions for Vercel Next.js deployments.

## Build Issues

### Build Command Fails

**Error:**
```
Command failed with exit code 1: bun run build
```

**Solutions:**
1. Test build locally: `bun run build`
2. Check for missing dependencies
3. Verify TypeScript errors: `bun run type-check`
4. Check Node version compatibility

### Module Not Found

**Error:**
```
Module not found: Can't resolve 'module-name'
```

**Solutions:**
1. Install missing package: `bun add module-name`
2. Check package.json dependencies
3. Verify imports are correct
4. Clear `.next` cache: `rm -rf .next`

### TypeScript Errors

**Error:**
```
Type error: Type 'string' is not assignable to type 'number'
```

**Solutions:**
1. Run type check: `bun run type-check`
2. Fix type errors in code
3. If urgent, set in next.config.ts:
```ts
typescript: {
  ignoreBuildErrors: true,
}
```

## Deployment Issues

### 404 on Page Refresh

**Error:**
```
404 page not found on refresh
```

**Solutions:**
1. Ensure vercel.json has proper routing:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```
2. Next.js handles this automatically in most cases
3. Check `_next` routes aren't blocked

### Environment Variables Not Working

**Error:**
```
process.env.VARIABLE_NAME is undefined
```

**Solutions:**
1. Verify variable in Vercel dashboard
2. Check correct environment (Production/Preview/Development)
3. For client-side: prefix with `NEXT_PUBLIC_`
4. Redeploy after adding variables
5. Check vercel.json env mapping

### Function Timeout

**Error:**
```
Function execution exceeded the maximum time allowed
```

**Solutions:**
1. Increase timeout in vercel.json:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```
2. Optimize function logic
3. Use Edge Functions for faster execution
4. Consider caching responses

### Memory Exceeded

**Error:**
```
Function memory usage exceeded the maximum allowed
```

**Solutions:**
1. Reduce bundle size
2. Lazy load components
3. Remove unused dependencies
4. Increase memory in vercel.json:
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 2048
    }
  }
}
```

## Runtime Issues

### Hydration Error

**Error:**
```
Hydration failed because the initial UI does not match
```

**Solutions:**
1. Check for mismatched SSR/client content
2. Use `suppressHydrationWarning`
3. Ensure consistent data rendering
4. Use dynamic imports for client-only components

### CORS Errors

**Error:**
```
Access to fetch at 'https://...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. Add CORS headers in vercel.json:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```
2. Or handle in API route

### Database Connection Failed

**Error:**
```
ECONNREFUSED or connection timeout
```

**Solutions:**
1. Verify DATABASE_URL is set
2. Check database is accessible from Vercel
3. For local DB, use data API or proxy
4. Check security groups/firewall rules

## Performance Issues

### Slow First Load

**Solutions:**
1. Enable ISR for dynamic pages
2. Optimize images with next/image
3. Use Edge Functions for API
4. Enable compression (automatic on Vercel)
5. Add analytics to monitor

### Large Bundle Size

**Solutions:**
1. Run bundle analyzer: `ANALYZE=true bun run build`
2. Use dynamic imports: `next/dynamic`
3. Tree-shake unused code
4. Remove unused dependencies

### High Server Response Time

**Solutions:**
1. Use ISR instead of SSR
2. Add caching headers
3. Optimize database queries
4. Use connection pooling

## GitHub Actions Issues

### Vercel Token Invalid

**Error:**
```
Error: The specified token is not valid
```

**Solutions:**
1. Generate new token at vercel.com/account/tokens
2. Ensure token has correct scopes
3. Add token to GitHub secrets
4. Check token isn't expired

### Org/Project ID Wrong

**Solutions:**
1. Run `vercel link` locally
2. Check `.vercel/project.json`
3. Get from Vercel dashboard URL

### Secrets Not Accessible

**Solutions:**
1. Verify secrets in GitHub repo settings
2. Check secrets are named correctly
3. Ensure workflow has correct permissions

## Edge Function Issues

### Edge Runtime Errors

**Error:**
```
Edge Function crashed
```

**Solutions:**
1. Check function uses compatible APIs
2. Avoid Node.js specific modules
3. Use `globalThis` instead of `window`
4. Check runtime logs in Vercel dashboard

### Cold Starts

**Solutions:**
1. Use cron jobs to keep warm
2. Enable `stale-while-revalidate`
3. Consider upgrading to Pro for better resources

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `FUN_001` | Function timeout | Increase maxDuration |
| `FUN_002` | Memory limit | Optimize bundle |
| `FUN_003` | Function crashed | Check logs |
| `BUILD_001` | Build failed | Check build output |
| `BUILD_002` | Build cancelled | Retry deployment |
| `DEPLOY_001` | Deploy limit | Upgrade plan |
| `DEPLOY_002` | Package limit | Reduce dependencies |

## Debugging Tips

### 1. Check Build Logs

```
Vercel Dashboard → Deployments → Build Logs
```

### 2. Check Function Logs

```
Vercel Dashboard → Functions → Function Logs
```

### 3. Test Locally

```bash
# Run dev server
bun run dev

# Run build
bun run build

# Run type check
bun run type-check

# Run lint
bun run lint
```

### 4. Use Debug Mode

```bash
# Verbose build output
DEBUG=* bun run build
```

### 5. Check Environment

```ts
console.log('Environment:', process.env.NODE_ENV)
console.log('Vercel:', process.env.VERCEL)
console.log('URL:', process.env.VERCEL_URL)
```

## Getting Help

### Resources

1. [Vercel Documentation](https://vercel.com/docs)
2. [Vercel Community](https://vercel.com/community)
3. [Next.js Documentation](https://nextjs.org/docs)
4. [GitHub Issues](https://github.com/vercel/next.js/issues)

### Reporting Issues

When reporting, include:
- Build logs
- Error messages
- Steps to reproduce
- Environment details
- Code snippets

## Quick Fix Checklist

- [ ] Run build locally first
- [ ] Check all dependencies are installed
- [ ] Verify environment variables
- [ ] Clear `.next` cache
- [ ] Check TypeScript errors
- [ ] Check ESLint errors
- [ ] Review build logs
- [ ] Check function logs
- [ ] Test in preview deployment
