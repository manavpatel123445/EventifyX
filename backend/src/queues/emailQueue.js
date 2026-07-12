import { Queue } from "bullmq";
import queueConfig from "../config/queue.js";
import QUEUE_NAMES from "../constants/queueNames.js";

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: queueConfig.connection.connection,
  defaultJobOptions: queueConfig.defaultJobOptions,
});

export default emailQueue;
