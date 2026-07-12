import mongoose from "mongoose";

/**
 * Ensures indexes on Mongoose models are built properly
 */
export const ensureIndexes = async () => {
  try {
    console.log("🛠️ Checking database indexes...");
    const models = mongoose.modelNames();
    for (const name of models) {
      const model = mongoose.model(name);
      await model.ensureIndexes();
      console.log(`✅ Index verified/synced for model: ${name}`);
    }
    console.log("🎉 All database indexes verified successfully.");
  } catch (error) {
    console.error("❌ Failed to verify database indexes:", error.message);
  }
};

export default ensureIndexes;
