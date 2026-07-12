import express from "express";
import categoryController from "./category.controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import categoryValidation from "./category.validation.js";

const router = express.Router();

router.get("/", optionalAuth, categoryController.getCategories);

router.post("/", protect, authorize("admin"), validate(categoryValidation.createCategorySchema), categoryController.createCategory);
router.put("/:id", protect, authorize("admin"), validate(categoryValidation.updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", protect, authorize("admin"), categoryController.deleteCategory);

export default router;
