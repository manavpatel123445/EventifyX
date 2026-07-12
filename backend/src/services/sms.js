import logger from "../utils/logger.js";

export const smsService = {
  sendSMS: async ({ to, message }) => {
    logger.info(`💬 Mock SMS Send to: ${to} | Message: ${message}`);
    // Twilio/Vonage integration template
    return { success: true };
  },
};

export default smsService;
