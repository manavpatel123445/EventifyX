import express from "express";
import userController from "./user.controller.js";
import { protect } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import userValidation from "./user.validation.js";

const router = express.Router();

router.use(protect);

router.get("/profile", userController.getProfile);
router.put("/profile", validate(userValidation.updateProfileSchema), userController.updateProfile);

router.get("/", authorize("admin"), userController.getUsers);
router.put("/:id/status", authorize("admin"), validate(userValidation.toggleStatusSchema), userController.toggleUserStatus);

export default router;
