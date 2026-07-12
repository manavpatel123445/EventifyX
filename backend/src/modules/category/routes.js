import express from "express";
import categoryController from "./controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import categoryValidation from "./validation.js";

const router = express.Router();

// Get categories is public but optionalAuth will decode the user info if logged in (for admin active check)
router.get("/", optionalAuth, categoryController.getCategories);

// Protected routes (Admin only)
router.post("/", protect, authorize("admin"), validate(categoryValidation.createCategorySchema), categoryController.createCategory);
router.put("/:id", protect, authorize("admin"), validate(categoryValidation.updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", protect, authorize("admin"), categoryController.deleteCategory);

export default router;
