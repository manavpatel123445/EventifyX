import express from "express";
import ticketController from "./ticket.controller.js";
import { protect } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);

router.get("/:id/verify", authorize("event_manager", "admin"), ticketController.verifyTicket);
router.post("/:id/use", authorize("event_manager", "admin"), ticketController.useTicket);

router.post("/", authorize("admin"), ticketController.generateTicket);

export default router;
