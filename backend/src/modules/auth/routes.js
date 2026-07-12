import express from "express";
import authController from "./controller.js";
import { protect } from "../../middlewares/auth.js";
import { authLimiter, apiLimiter } from "../../middlewares/rateLimiter.js";
import { validate } from "../../middlewares/validation.js";
import authValidation from "./validation.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authLimiter, validate(authValidation.registerSchema), authController.register);
router.post("/login", authLimiter, validate(authValidation.loginSchema), authController.login);
router.post("/refresh", authLimiter, validate(authValidation.refreshSchema), authController.refresh);
router.post("/forgot-password", authLimiter, validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.put("/reset-password/:resettoken", authLimiter, validate(authValidation.resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get("/me", protect, apiLimiter, authController.getMe);

export default router;
