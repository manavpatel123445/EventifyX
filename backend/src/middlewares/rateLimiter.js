import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import config from "../config/environment.js";

// Initialize Redis Client for Rate Limiter (only if REDIS_URL is configured)
let store;

if (config.redis.url && !config.redis.url.includes('localhost') && !config.redis.url.includes('127.0.0.1')) {
  try {
    const redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => (times > 1 ? null : 500),
      enableOfflineQueue: false,
    });
    redisClient.on('error', () => {}); // silence errors silently
    store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  } catch (error) {
    console.warn("⚠️ Rate limiter falling back to in-memory store.");
  }
} else {
  console.warn("⚠️ No external REDIS_URL — rate limiter using in-memory store.");
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: store || undefined,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 15, // Limit each IP to 15 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: store || undefined,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after an hour",
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20, // Limit checkout session creation
  standardHeaders: true,
  legacyHeaders: false,
  store: store || undefined,
  message: {
    success: false,
    message: "Too many checkout attempts, please try again later",
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: store || undefined,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
});
