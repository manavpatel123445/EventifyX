import { cacheService } from '../services/cache.service.js';
import { lockService } from '../services/lock.service.js';
import { generateCacheKey } from '../utils/cacheKey.util.js';
import redis from '../config/redis.js';

/**
 * Middleware for caching API responses using Cache-Aside + Stampede Protection.
 * @param {Object} options
 * @param {string} options.module - The module name (e.g., 'categories')
 * @param {string} options.resource - The resource name (e.g., 'list')
 * @param {number} options.ttl - Cache TTL in seconds
 * @param {string} options.scope - 'public' | 'user' | 'admin'
 */
export const cacheMiddleware = ({ module, resource, ttl = 300, scope = 'public' }) => {
  return async (req, res, next) => {
    // 1. Skip cache if not a GET request
    if (req.method !== 'GET') {
      return next();
    }

    // 2. Identify Scope
    let identifier = 'all';
    if (scope === 'user') {
      if (!req.user || !req.user._id) return next();
      identifier = `userId_${req.user._id}`;
    } else if (scope === 'admin') {
      if (!req.user || req.user.role !== 'admin') return next();
      identifier = 'admin';
    }

    // 3. Build Key
    const key = generateCacheKey(module, resource, identifier, req.query);
    const lockKey = `lock:${key}`;

    try {
      // 4. Check Redis connection
      if (redis.status !== 'ready') {
        res.setHeader('X-Cache', 'BYPASS');
        return next();
      }

      // 5. Try to get from Cache
      const cachedData = await cacheService.get(key);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedData);
      }

      res.setHeader('X-Cache', 'MISS');

      // 6. Cache Miss - Try to acquire lock to prevent stampede
      const lockId = await lockService.acquire(lockKey, 15);
      
      if (!lockId) {
        // Another request is rebuilding the cache. We can either:
        // A) Wait (polling)
        // B) Just query the DB this time to avoid hanging.
        // For simplicity and to prevent hanging, we just bypass.
        res.setHeader('X-Cache', 'BYPASS_STAMPEDE');
        return next();
      }

      // 7. Override res.json to catch the outgoing response
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache successful responses that have data
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
          cacheService.set(key, body, ttl);
        }
        
        // Release lock
        lockService.release(lockKey, lockId);
        
        // Call original res.json
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error(`❌ Cache Middleware Error:`, error.message);
      res.setHeader('X-Cache', 'ERROR');
      next();
    }
  };
};
