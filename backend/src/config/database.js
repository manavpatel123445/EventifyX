import config from "./environment.js";

export const dbConfig = {
  url: config.mongodb.url,
  options: config.mongodb.options,
};

export default dbConfig;
