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
dotenv.config();
db();

const app = express();

// CORS with credentials support - FORCE ALLOW LOCALHOST
const allowedOrigins = [
  // FORCE ALLOW local development - always include these
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://eventify-x-wqka-git-01-ad-156d02-manav-patels-projects-dc745a7f.vercel.app",
  "https://eventify-x-wqka-bce6q4ghn-manav-patels-projects-dc745a7f.vercel.app/",
  "https://eventify-x-wqka.vercel.app",
  "https://eventifyx.onrender.com",

  
];

console.log('🌐 Final Allowed CORS Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        console.log('✅ Allowing request with no origin (mobile/curl/Postman)');
        return callback(null, true);
      }

      // Check if origin is explicitly allowed or is a Vercel preview domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (typeof origin === 'string' && origin.endsWith('.vercel.app'));

      if (isAllowed) {
        console.log(`✅ Allowing CORS request from: ${origin}`);
        return callback(null, true);
      }

      console.log(`❌ Blocking CORS request from: ${origin}`);
      console.log('📋 Allowed origins:', allowedOrigins);
      console.log('🔍 Current origin:', origin);

      // Special handling for localhost requests
      if (origin.includes('localhost')) {
        console.log('🚨 LOCALHOST REQUEST BLOCKED! This should not happen with current config.');
        console.log('🔧 Make sure to remove CLIENT_URL from Render environment variables');
      }

      return callback(new Error(`CORS policy: Origin ${origin} not allowed.`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    optionsSuccessStatus: 200, // Support legacy browsers
  })
);

// Stripe webhook must use raw body AND be registered before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());

// Middleware to remove Permissions-Policy header from response
app.use((req, res, next) => {
  // Create a reference to the original send function
  const originalSend = res.send;
  
  // Override the send function
  res.send = function(body) {
    // Remove the headers right before sending the response
    res.removeHeader('Permissions-Policy');
    res.removeHeader('permissions-policy');
    
    // Call the original send function
    return originalSend.call(this, body);
  };
  
  next();
});

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