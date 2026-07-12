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
      default: "📁",
    },
    color: {
      type: String,
      default: "#6B7280",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ status: 1 });

export const Category = mongoose.model("Category", categorySchema);
export default Category;
