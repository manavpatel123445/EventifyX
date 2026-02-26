import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../controllers/userController.js";

const router = express.Router();


router.use(protect);


router.get("/me", getProfile);

router.put("/me", updateProfile);

router.patch("/me/change-password", changePassword);

router.delete("/me", deleteAccount);

export default router;




