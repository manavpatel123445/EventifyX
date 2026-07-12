import logger from "../utils/logger.js";

export const emailService = {
  sendMail: async ({ to, subject, html }) => {
    logger.info(`📧 Mock Send Mail to: ${to} | Subject: ${subject}`);
    // Real integration (e.g. Resend, Sendgrid) can be set here.
    return { success: true };
  },
};

export default emailService;
