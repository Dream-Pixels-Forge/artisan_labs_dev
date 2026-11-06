/**
 * Environment Variable Validation
 * Validates required environment variables at application startup and
 * enforces secret strength so secrets are never silently missing in production.
 */

const requiredEnvVars: string[] = [
  'NEXTAUTH_SECRET',
]

const optionalEnvVars: string[] = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
]

interface ValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

export function validateEnv(): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required env vars
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  // Check optional env vars and warn if missing in production
  if (process.env.NODE_ENV === 'production') {
    for (const key of optionalEnvVars) {
      if (!process.env[key]) {
        warnings.push(`${key} is not set (optional but recommended for production)`)
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

export function validateSecretStrength(secret: string): boolean {
  return (
    secret.length >= 32 &&
    /[A-Z]/.test(secret) &&
    /[a-z]/.test(secret) &&
    /[0-9]/.test(secret)
  )
}

export function assertEnv(): void {
  const result = validateEnv()

  if (result.missing.length > 0) {
    throw new Error(
      `[Env] Missing required environment variables: ${result.missing.join(', ')}`,
    )
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (secret && !validateSecretStrength(secret)) {
    throw new Error(
      '[Env] NEXTAUTH_SECRET is too weak: use >=32 chars with uppercase, lowercase, and a digit.',
    )
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('[Env Warning]', result.warnings.join('; '))
  }
}

// Run validation on import in development
if (process.env.NODE_ENV === 'development') {
  const result = validateEnv()
  if (result.missing.length > 0) {
    console.warn(
      `[Env] Missing env vars (optional in dev): ${result.missing.join(', ')}`,
    )
  }
}
