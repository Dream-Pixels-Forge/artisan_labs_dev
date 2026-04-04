# Security Headers Configuration

Complete guide to configuring security headers for Vercel Next.js deployments.

## Why Security Headers Matter

Security headers help protect your application from common web vulnerabilities:
- XSS attacks
- Clickjacking
- MIME sniffing
- Cross-site request forgery (CSRF)

## Headers Configuration in vercel.json

### Complete Security Headers

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ]
}
```

## Header Reference

### X-Frame-Options

Prevents your site from being embedded in iframes.

| Value | Description |
|-------|-------------|
| `DENY` | Never allow framing |
| `SAMEORIGIN` | Allow framing from same origin |

```json
{ "key": "X-Frame-Options", "value": "DENY" }
```

### X-Content-Type-Options

Prevents MIME-type sniffing.

| Value | Description |
|-------|-------------|
| `nosniff` | Don't allow MIME sniffing |

```json
{ "key": "X-Content-Type-Options", "value": "nosniff" }
```

### X-XSS-Protection

Enables XSS filtering (legacy browsers).

| Value | Description |
|-------|-------------|
| `0` | Disable filter |
| `1` | Enable filter, sanitize |
| `1; mode=block` | Enable filter, block page |

```json
{ "key": "X-XSS-Protection", "value": "1; mode=block" }
```

### Referrer-Policy

Controls how much referrer info is sent.

| Value | Description |
|-------|-------------|
| `no-referrer` | No referrer |
| `no-referrer-when-downgrade` | Default, no referrer for weaker HTTPS→HTTP |
| `same-origin` | Send for same origin |
| `strict-origin-when-cross-origin` | Full URL for same origin, origin for cross-origin |
| `strict-origin-when-cross-origin` | Origin only |

```json
{ "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
```

### Permissions-Policy

Controls browser feature access.

```json
{
  "key": "Permissions-Policy",
  "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
}
```

Available features:
- `camera`, `microphone`, `geolocation`
- `payment`, `usb`, `bluetooth`
- `ambient-light-sensor`, `accelerometer`
- `gyroscope`, `magnetometer`

### Cross-Origin-Opener-Policy (COOP)

```json
{ "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
```

### Cross-Origin-Resource-Policy (CORP)

```json
{ "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
```

### Cross-Origin-Embedder-Policy (COEP)

Required for SharedArrayBuffer (performance features).

```json
{ "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
```

## Content Security Policy (CSP)

### Basic CSP

```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    }
  ]
}
```

### Strict CSP (Recommended)

```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    }
  ]
}
```

### CSP Directives

| Directive | Description | Example |
|-----------|-------------|---------|
| `default-src` | Default policy | `'self'` |
| `script-src` | JavaScript sources | `'self' 'unsafe-inline'` |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` |
| `img-src` | Image sources | `'self' data: https:` |
| `font-src` | Font sources | `'self' data:` |
| `connect-src` | Fetch/XHR sources | `'self' https:` |
| `frame-ancestors` | Embedding options | `'none'` |
| `base-uri` | Base URL | `'self'` |
| `form-action` | Form actions | `'self'` |

## API-Specific Headers

### CORS for API Routes

```json
{
  "source": "/api/(.*)",
  "headers": [
    { "key": "Access-Control-Allow-Origin", "value": "https://example.com" },
    { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
    { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
    { "key": "Access-Control-Allow-Credentials", "value": "true" },
    { "key": "Access-Control-Max-Age", "value": "86400" }
  ]
}
```

### API Cache Control

```json
{
  "source": "/api/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "no-store, max-age=0" },
    { "key": "Pragma", "value": "no-cache" }
  ]
}
```

## Static Assets Headers

### Images

```json
{
  "source": "/(.*)\\.(jpg|jpeg|png|gif|webp|avif|svg)$",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

### Fonts

```json
{
  "source": "/(.*)\\.(woff|woff2|ttf|eot)$",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

### JavaScript & CSS

```json
{
  "source": "/_next/static/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

## Next.js Config Headers

You can also configure headers in `next.config.ts`:

```ts
const nextConfig = {
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
};

export default nextConfig;
```

## Security Headers Checklist

- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: Restrict features
- [ ] Content-Security-Policy: Custom policy
- [ ] Cross-Origin-Opener-Policy: same-origin (if needed)
- [ ] Cross-Origin-Resource-Policy: same-origin (if needed)

## Testing Security Headers

### Online Tools

- [securityheaders.com](https://securityheaders.com)
- [observatory.mozilla.org](https://observatory.mozilla.org)
- [sslabs.com/ssltest/](https://www.ssllabs.com/ssltest/)

### CLI Tool

```bash
# Using curl
curl -I https://your-app.vercel.app
```

Expected output should include security headers.

## Common Issues

### CSP Blocks Resources

If CSP blocks analytics or third-party scripts:

1. Identify blocked resource
2. Add domain to appropriate CSP directive
3. Test thoroughly

### COOP/COEP Breaks Embeddings

If you use third-party embeds:

1. Set COOP to `same-origin`
2. Set CORP to `same-origin`
3. Or remove if embeds required

## References

- [MDN: Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Reference](https://content-security-policy.com/)
