import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (use Redis in production for multiple instances)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 60000) // Clean every minute

interface RateLimitConfig {
    max: number       // Maximum requests
    windowMs: number  // Time window in milliseconds
    keyPrefix?: string // Optional prefix for the key
}

/**
 * Create a rate limiter middleware
 * @param config Rate limit configuration
 * @returns Function that checks rate limit
 */
export function createRateLimiter(config: RateLimitConfig) {
    const { max, windowMs, keyPrefix = '' } = config

    return (req: NextRequest): NextResponse | null => {
        const ip = getClientIP(req)
        const key = `${keyPrefix}:${ip}`
        const now = Date.now()

        const record = rateLimitStore.get(key)

        if (!record || now > record.resetTime) {
            // First request or window expired - start new window
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
            return null
        }

        if (record.count >= max) {
            // Rate limit exceeded
            const retryAfter = Math.ceil((record.resetTime - now) / 1000)
            return NextResponse.json(
                {
                    success: false,
                    error: 'Too many requests. Please try again later.',
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfter),
                        'X-RateLimit-Limit': String(max),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(record.resetTime),
                    }
                }
            )
        }

        // Increment count
        record.count++
        rateLimitStore.set(key, record)
        return null
    }
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
    // Check various headers for the real IP (behind proxies)
    const forwarded = req.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIP = req.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    // Fallback
    return 'unknown'
}

// Pre-configured rate limiters for common use cases

/**
 * Standard rate limiter: 5 requests per 5 minutes (for forms)
 */
export const formRateLimiter = createRateLimiter({
    max: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    keyPrefix: 'form',
})

/**
 * Strict rate limiter: 3 requests per 5 minutes (for auth)
 */
export const authRateLimiter = createRateLimiter({
    max: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    keyPrefix: 'auth',
})

/**
 * Lenient rate limiter: 100 requests per minute (for general API)
 */
export const apiRateLimiter = createRateLimiter({
    max: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'api',
})
