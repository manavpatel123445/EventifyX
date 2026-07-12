import config from "./environment.js";

export const redisConfig = {
  url: config.redis.url,
  options: {
    maxRetriesPerRequest: null, // Critical for BullMQ compatibility
    enableReadyCheck: false,
  },
};

export default redisConfig;
