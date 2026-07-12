import mongoose from "mongoose";
import config from "../config/environment.js";

export const connectDB = async () => {
  if (!config.mongodb.url) {
    console.error("❌ CRITICAL: MONGODB_URL environment variable is NOT defined!");
    if (config.env === "production") {
      process.exit(1);
    }
    return null;
  }

  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(config.mongodb.url, config.mongodb.options);
    console.log(`✅ Successfully connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    throw err;
  }
};

export default connectDB;
