import config from "./environment.js";

export const loggerConfig = {
  level: process.env.LOG_LEVEL || (config.env === "development" ? "debug" : "info"),
  silent: config.env === "test",
};

export default loggerConfig;
