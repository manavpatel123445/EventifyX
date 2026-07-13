import redis from '../config/redis.js';

export const cacheService = {
  /**
   * Get parsed value from cache safely.
   */
  async get(key) {
    try {
      if (redis.status !== 'ready') return null;
      
      const data = await redis.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Cache GET Error for key ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Set value in cache with TTL (seconds).
   */
  async set(key, value, ttl = 300) {
    try {
      if (redis.status !== 'ready') return;
      
      const stringifiedData = JSON.stringify(value);
      await redis.setex(key, ttl, stringifiedData);
    } catch (error) {
      console.error(`❌ Cache SET Error for key ${key}:`, error.message);
    }
  },

  /**
   * Delete a specific key.
   */
  async del(key) {
    try {
      if (redis.status !== 'ready') return;
      await redis.del(key);
    } catch (error) {
      console.error(`❌ Cache DEL Error for key ${key}:`, error.message);
    }
  },

  /**
   * Delete all keys matching a pattern.
   * Useful for invalidating a whole module's cache.
   */
  async delByPattern(pattern) {
    try {
      if (redis.status !== 'ready') return;
      
      let cursor = '0';
      const keysToDelete = [];
      
      // Use SCAN for performance instead of KEYS
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          keysToDelete.push(...keys);
        }
      } while (cursor !== '0');
      
      if (keysToDelete.length > 0) {
        // Delete in batches of 100
        for (let i = 0; i < keysToDelete.length; i += 100) {
          const batch = keysToDelete.slice(i, i + 100);
          await redis.del(...batch);
        }
        console.log(`🧹 Cache cleared ${keysToDelete.length} keys matching: ${pattern}`);
      }
    } catch (error) {
      console.error(`❌ Cache delByPattern Error for pattern ${pattern}:`, error.message);
    }
  }
};
