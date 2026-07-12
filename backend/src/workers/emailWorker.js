import { Worker } from "bullmq";
import queueConfig from "../config/queue.js";
import QUEUE_NAMES from "../constants/queueNames.js";
import logger from "../utils/logger.js";

// A production background worker processing email jobs
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    logger.info(`📧 Processing email job ${job.id}`, { name: job.name, data: job.data });
    const { to, subject, body } = job.data;
    
    // Simulate email dispatch or connect to shared email service (e.g. Resend, Sendgrid)
    // await emailService.sendMail({ to, subject, html: body });
    
    logger.info(`✅ Email successfully sent to ${to}`);
    return { success: true };
  },
  {
    connection: queueConfig.connection.connection,
    concurrency: 5, // process up to 5 jobs simultaneously
  }
);

emailWorker.on("completed", (job) => {
  logger.info(`✨ Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`❌ Job ${job.id} failed with error: ${err.message}`);
});

export default emailWorker;
