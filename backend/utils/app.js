import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "../db.js";

import categoryRouter from "../routers/categoryRouters.js";
import authRouter from "../routers/authRouters.js";
import eventRouter from "../routers/eventRouters.js";
import adminRouter from "../routers/adminRoutes.js";
import userRouter from "../routers/userRouters.js";
import eventManagerRequestRouter from "../routers/eventManagerRequestRoutes.js";
import paymentRouter from "../routers/paymentRoutes.js";
import uploadRouter from "../routers/uploadRoutes.js";
import { stripeWebhook } from "../controllers/paymentController.js";
// Load environment variables
dotenv.config();
db();

const app = express();

// CORS with credentials support
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhook must use raw body AND be registered before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

// Remove any Permissions-Policy header entirely to avoid browser warnings
app.use((req, res, next) => {
  res.removeHeader("Permissions-Policy");
  next();
});

// Auth routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("EventifyX API is running...");
});

app.use("/api/events", eventRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);
app.use("/api/manager-requests", eventManagerRequestRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/uploads", uploadRouter);

export default app;