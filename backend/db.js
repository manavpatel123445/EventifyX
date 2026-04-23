import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URI;

export const connectDB = async () => {
  if (!MONGODB_URL) {
    console.error("❌ CRITICAL: MONGODB_URL environment variable is NOT defined!");
    console.error("The server will start but all database operations will fail.");
    return null;
  }
  
  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, // Wait only 5 seconds before timeout
    });
    console.log(`✅ Successfully connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(`   - Message: ${err.message}`);
    
    if (err.message.includes("whitelist")) {
      console.error("   - Action Required: Your current IP is likely not whitelisted in MongoDB Atlas.");
    }
    
    console.error("\nPlease check your MongoDB connection string and network connectivity.");
    throw err; // Throw instead of exiting here to allow server.js to handle it
  }
};
export default connectDB;