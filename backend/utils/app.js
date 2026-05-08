import express from "express";
import cors from "cors";
import helmet from "helmet";
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

const app = express();
app.use(helmet());

// CORS with credentials support
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : []),
].filter(Boolean);

const allowedOrigins = Array.from(
  new Set(["http://localhost:5173", ...configuredOrigins])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server and tools without Origin header
      if (!origin) {
        return callback(null, true);
      }

      const isProduction = process.env.NODE_ENV === "production";
      const isVercelOrigin = /\.vercel\.app$/.test(origin);
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const isExplicitlyAllowed = allowedOrigins.includes(origin);

      // In production, be more strict
      if (isProduction) {
        if (isExplicitlyAllowed || isVercelOrigin) {
          return callback(null, true);
        }
      } else {
        // In development, allow localhost and explicitly allowed
        if (isExplicitlyAllowed || isLocalhost) {
          return callback(null, true);
        }
      }

      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Stripe webhook must use raw body AND be registered before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

// Auth routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("EventifyX API is running...");
});

// Health check endpoint for Render.com monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});



app.use("/api/events", eventRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);
app.use("/api/manager-requests", eventManagerRequestRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/uploads", uploadRouter);

export default app;
