import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Simple in-memory rate limiter (for production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Get identifier (IP address or user ID)
    const identifier = (req as any).user?.id || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${identifier}:${req.path}`;
    const now = Date.now();

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = store[key];
    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    // Check if limit exceeded
    if (entry.count > max) {
      return next(createError(message, 429));
    }

    // Track response status for skip options
    const originalSend = res.send;
    res.send = function (body) {
      const statusCode = res.statusCode;
      
      if (skipSuccessfulRequests && statusCode < 400) {
        entry.count = Math.max(0, entry.count - 1);
      }
      
      if (skipFailedRequests && statusCode >= 400) {
        entry.count = Math.max(0, entry.count - 1);
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

// Predefined rate limiters
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later',
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful logins
});

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour for authenticated users
  message: 'Rate limit exceeded. Please slow down your requests',
});





