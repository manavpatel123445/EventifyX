import config from "./environment.js";

export const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, server-to-server)
    if (!origin) return callback(null, true);

    const isProduction = config.env === "production";
    const isVercelOrigin = /\.vercel\.app$/.test(origin);
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    const allowedOrigins = [config.cors.clientUrl, ...config.cors.allowedOrigins];

    if (isProduction) {
      if (allowedOrigins.includes(origin) || isVercelOrigin) {
        return callback(null, true);
      }
    } else {
      if (allowedOrigins.includes(origin) || isLocalhost) {
        return callback(null, true);
      }
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Request-ID"],
};

export default corsConfig;
