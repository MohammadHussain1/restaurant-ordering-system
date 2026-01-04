import { rateLimit } from 'express-rate-limit';
import { Request } from 'express';
import { AuthenticatedRequest } from './auth';

// Rate limiter for general API requests
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for user-specific rate limiting (20 requests per user per minute)
export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req: Request) => {
    // If user is authenticated, allow 20 requests per minute
    // Otherwise, default to 5 requests per minute
    if ((req as AuthenticatedRequest).user) {
      return 20;
    }
    return 5;
  },
  keyGenerator: (req: Request) => {
    // Use user ID if available, otherwise use IP address
    const authenticatedReq = req as AuthenticatedRequest;
    if (authenticatedReq.user && authenticatedReq.user.id) {
      return authenticatedReq.user.id;
    }
    return req.ip || 'unknown';
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});