import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";


import { protect, authorize } from "../middlewares/authMiddleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import { CACHE_PREFIX, CACHE_TTL } from "../constants/cache.constants.js";

const router = express.Router();

// Cache categories for 15 minutes (LONG) since they rarely change
router.get("/", cacheMiddleware({ 
  module: CACHE_PREFIX.CATEGORIES, 
  resource: 'list', 
  ttl: CACHE_TTL.LONG, 
  scope: 'public' 
}), getCategories);


router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
