import express from "express";
import ticketController from "./controller.js";
import { protect } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);

// Verify and validate tickets (Managers / Admins scan ticket QR codes at venue gate)
router.get("/:id/verify", authorize("event_manager", "admin"), ticketController.verifyTicket);
router.post("/:id/use", authorize("event_manager", "admin"), ticketController.useTicket);

// Internal usage to trigger ticket generation manually
router.post("/", authorize("admin"), ticketController.generateTicket);

export default router;
