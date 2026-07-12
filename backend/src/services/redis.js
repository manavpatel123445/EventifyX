import Redis from "ioredis";
import config from "../config/environment.js";

let redisClient = null;

try {
  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
  });

  redisClient.on("connect", () => {
    console.log("✅ Successfully connected to Redis Cache");
  });

  redisClient.on("error", (error) => {
    console.warn("⚠️ Redis Error:", error.message);
  });
} catch (error) {
  console.warn("⚠️ Redis could not be initialized:", error.message);
}

export const redisService = {
  get: async (key) => {
    if (!redisClient) return null;
    return redisClient.get(key);
  },

  set: async (key, value, expirySeconds) => {
    if (!redisClient) return null;
    if (expirySeconds) {
      return redisClient.set(key, value, "EX", expirySeconds);
    }
    return redisClient.set(key, value);
  },

  del: async (key) => {
    if (!redisClient) return null;
    return redisClient.del(key);
  },

  getClient: () => redisClient,
};

export default redisService;
