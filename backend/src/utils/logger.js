import winston from "winston";
import { AsyncLocalStorage } from "async_hooks";
import loggerConfig from "../config/logger.js";

// Setup Async Local Storage for request context
export const requestStore = new AsyncLocalStorage();

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom console format for development
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const store = requestStore.getStore();
  const requestId = store?.requestId ? `[ReqID: ${store.requestId}]` : "";
  const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
  return `${timestamp} ${level}: ${message} ${requestId} ${metaStr}`;
});

// Custom JSON format for production (includes requestId automatically)
const jsonWithRequestId = winston.format((info) => {
  const store = requestStore.getStore();
  if (store?.requestId) {
    info.requestId = store.requestId;
  }
  return info;
});

export const logger = winston.createLogger({
  level: loggerConfig.level,
  silent: loggerConfig.silent,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    jsonWithRequestId(),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" 
        ? combine(timestamp(), jsonWithRequestId(), json())
        : combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat)
    })
  ]
});

export default logger;
