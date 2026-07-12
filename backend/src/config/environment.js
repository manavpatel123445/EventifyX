import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGODB_URL",
  "STRIPE_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

// Validate critical environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("❌ CRITICAL ERROR: Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

validateEnv();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || "15m",
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
  },
  mongodb: {
    url: process.env.MONGODB_URL,
    options: {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  redis: {
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
      : [],
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  },
};

export default config;
