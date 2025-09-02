import express from "express";
import { register, login, refresh, getMe, createAdmin } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/register", register);

router.post("/login", login);
router.post("/refresh", refresh);

router.get("/me", protect, getMe);

router.post("/create-admin", createAdmin);

export default router;
