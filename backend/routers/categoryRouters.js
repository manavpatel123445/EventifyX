import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get categories
router.get("/", getCategories);

// Protected: Only logged-in (admin) can manage categories
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
