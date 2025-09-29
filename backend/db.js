import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

export const connectDB = async () => {
  if (!MONGODB_URL) {
    console.warn("⚠️ MONGODB_URL environment variable is not defined!");
    console.warn("🔧 For development, you can use: mongodb://localhost:27017/eventifyx");
    console.warn("📝 Database operations will not work until MongoDB is connected");
    return; // Don't exit, just warn
  }

  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Successfully connected to MongoDB");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("🔧 Please check your MongoDB connection string and network connectivity.");
    console.error("📝 Continuing without database connection for development");
  }
};
export default connectDB;