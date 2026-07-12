import express from "express";
import eventManagerRequestController from "./controller.js";
import { protect } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import requestValidation from "./validation.js";

const router = express.Router();

router.use(protect);

// User endpoints
router.post("/", validate(requestValidation.submitRequestSchema), eventManagerRequestController.submitEventManagerRequest);
router.get("/user", eventManagerRequestController.getUserRequest);
router.delete("/:id", eventManagerRequestController.deleteRequest);

// Admin endpoints
router.get("/", authorize("admin"), eventManagerRequestController.getAllRequests);
router.put("/:id/approve", authorize("admin"), validate(requestValidation.adminActionSchema), eventManagerRequestController.approveRequest);
router.put("/:id/reject", authorize("admin"), validate(requestValidation.adminActionSchema), eventManagerRequestController.rejectRequest);

export default router;
