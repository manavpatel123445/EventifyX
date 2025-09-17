import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "📁"
    },
    color: {
      type: String,
      default: "#6B7280"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
     },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);