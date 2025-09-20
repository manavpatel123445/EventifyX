import rateLimit from 'express-rate-limit';

// Rate limit configuration
const getRateLimitConfig = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max,      // limit each IP to 100 requests per windowMs by default
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  });
};

// Different rate limits for different types of routes
export const authLimiter = getRateLimitConfig(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
export const apiLimiter = getRateLimitConfig(15 * 60 * 1000, 100); // 100 requests per 15 minutes for API
export const publicLimiter = getRateLimitConfig(60 * 60 * 1000, 1000); // 1000 requests per hour for public routes
export const strictLimiter = getRateLimitConfig(60 * 60 * 1000, 10); // 10 requests per hour for sensitive operations

export default getRateLimitConfig;
