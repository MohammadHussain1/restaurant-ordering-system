import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { getRedisClient } from '../config/redis';

// Rate limiter using Redis for storage
export const createRateLimiter = (windowMs: number, max: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const redisClient = getRedisClient();
    
    // Use user ID if authenticated, otherwise use IP address
    const authenticatedReq = req as AuthenticatedRequest;
    const key = authenticatedReq.user ? 
      `rate_limit:user:${authenticatedReq.user.id}` : 
      `rate_limit:ip:${req.ip}`;
    
    try {
      // Get current count and expiration time from Redis
      const current = await redisClient.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count === 0) {
        // First request in this window, set the counter with expiration
        await redisClient.setEx(key, Math.floor(windowMs / 1000), '1');
        next();
      } else if (count < max) {
        // Increment the counter
        await redisClient.incr(key);
        next();
      } else {
        // Rate limit exceeded
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
        });
      }
    } catch (error) {
      // If Redis is unavailable, continue with the request
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

// Rate limiter for general API requests (100 requests per 15 minutes)
export const generalRateLimiter = createRateLimiter(15 * 60 * 1000, 100);

// Rate limiter for authentication endpoints (5 attempts per 15 minutes)
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);

// Rate limiter for user-specific rate limiting (20 requests per minute)
export const userRateLimiter = createRateLimiter(60 * 1000, 20);