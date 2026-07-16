import redis from '../config/redis.js';
import crypto from 'crypto';

/**
 * Distributed Lock Service to prevent Cache Stampedes.
 */
export const lockService = {
  /**
   * Attempt to acquire a lock.
   * @param {string} resourceKey - The key to lock (e.g., 'lock:events:all')
   * @param {number} ttlSeconds - How long the lock is held (e.g., 10s)
   * @returns {string|null} lockId if acquired, null if failed
   */
  async acquire(resourceKey, ttlSeconds = 10) {
    try {
      if (redis.status !== 'ready') return null;
      
      const lockId = crypto.randomBytes(16).toString('hex');
      
      // Set key only if it does not exist (NX)
      const result = await redis.set(resourceKey, lockId, 'EX', ttlSeconds, 'NX');
      
      if (result === 'OK') {
        return lockId;
      }
      return null;
    } catch (error) {
      console.error(`❌ Lock Acquire Error for ${resourceKey}:`, error.message);
      return null;
    }
  },

  /**
   * Release a previously acquired lock safely using Lua script.
   */
  async release(resourceKey, lockId) {
    try {
      if (redis.status !== 'ready') return;
      
      // Lua script ensures we only delete the lock if we own it
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
      `;
      
      await redis.eval(script, 1, resourceKey, lockId);
    } catch (error) {
      console.error(`❌ Lock Release Error for ${resourceKey}:`, error.message);
    }
  }
};
