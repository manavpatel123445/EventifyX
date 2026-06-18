import express from "express";
import { 
  register, 
  login, 
  refresh, 
  getMe, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  authLimiter, 
  apiLimiter, 
  strictLimiter 
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:resettoken", authLimiter, resetPassword);

// Protected routes
router.get("/me", protect, apiLimiter, getMe);

export default router;
