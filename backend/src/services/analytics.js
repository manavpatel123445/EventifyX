import logger from "../utils/logger.js";

export const analyticsService = {
  trackEvent: async (eventName, properties = {}) => {
    logger.info(`📊 Tracking Event: ${eventName}`, { properties });
    // Mixpanel/Google Analytics integration template
    return { success: true };
  },
};

export default analyticsService;
