import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window cache per IP + key
const ipCache = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipCache.entries()) {
      if (now > record.resetTime) {
        ipCache.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit: number;       // Max requests in window
  windowMs: number;    // Window size in milliseconds
  keyPrefix?: string;  // Namespace for route
}

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 NextResponse if rate limit exceeded.
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(request);
  const prefix = options.keyPrefix || 'global';
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let record = ipCache.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    ipCache.set(key, record);
    return null;
  }

  record.count += 1;

  if (record.count > options.limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}
