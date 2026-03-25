const attempts = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory rate limiter. Resets on cold start (serverless).
 * Returns true if the request is allowed, false if blocked.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}
