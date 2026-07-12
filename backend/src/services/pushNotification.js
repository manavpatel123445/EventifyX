import logger from "../utils/logger.js";

export const pushNotificationService = {
  sendPush: async ({ deviceToken, title, body, data }) => {
    logger.info(`🔔 Mock Push Send to Token: ${deviceToken} | Title: ${title}`);
    // FCM/OneSignal Firebase Admin integration template
    return { success: true };
  },
};

export default pushNotificationService;
