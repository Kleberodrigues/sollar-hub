/**
 * Simple in-memory rate limiter for Server Actions
 *
 * Note: For production with multiple instances, consider using
 * Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

// In-memory storage for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  remaining: number;
  resetTime: number;
} {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or entry has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Pre-configured rate limit configs for different scenarios
 */
export const rateLimitConfigs = {
  // Auth actions: 5 requests per minute (prevent brute force)
  auth: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5,
  },

  // General API actions: 30 requests per minute
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Heavy operations (exports, reports): 5 per 5 minutes
  heavy: {
    interval: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
  },

  // User management: 10 per minute
  userManagement: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // Stripe endpoints: 10 per minute (prevent abuse of payment APIs)
  stripe: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // Stripe checkout: 5 per 5 minutes (prevent excessive session creation)
  stripeCheckout: {
    interval: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
  },
} as const;

/**
 * Get client IP from headers (works with Next.js Server Actions)
 * Falls back to a default value if IP cannot be determined
 */
export function getClientIP(headers: Headers): string {
  // Try common headers in order of preference
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return "127.0.0.1";
}

/**
 * Higher-order function to wrap Server Actions with rate limiting
 *
 * @example
 * export const myAction = withRateLimit(
 *   async (formData: FormData) => { ... },
 *   rateLimitConfigs.auth
 * );
 */
export function withRateLimit<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  config: RateLimitConfig
): (...args: T) => Promise<R | { error: string }> {
  return async (...args: T) => {
    // Import headers dynamically to avoid issues with SSR
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    const result = checkRateLimit(clientIP, config);

    if (!result.success) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return {
        error: `Muitas requisições. Tente novamente em ${retryAfter} segundos.`,
      };
    }

    return action(...args);
  };
}
