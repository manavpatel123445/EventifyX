import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

// If no REDIS_URL is set, skip Redis entirely
if (!REDIS_URL) {
  console.warn('⚠️  No REDIS_URL set — Redis disabled. Caching, rate-limiting, and queues will use fallbacks.');
}

const redis = new Redis(REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 0,
  retryStrategy(times) {
    // If no REDIS_URL configured, stop retrying immediately
    if (!REDIS_URL || times > 1) {
      return null; // stop retrying
    }
    return Math.min(times * 500, 2000);
  },
  enableOfflineQueue: false,
  lazyConnect: !REDIS_URL, // don't auto-connect if no URL configured
});

redis.on('connect', () => {
  console.log('✅ Redis Connected');
});

redis.on('error', (err) => {
  // Only log if REDIS_URL was explicitly set (unexpected failure)
  if (REDIS_URL) {
    console.error('❌ Redis Error:', err.message);
  }
});

export default redis;
