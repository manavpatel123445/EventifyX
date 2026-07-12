import express from "express";
import cors from "cors";
import helmet from "helmet";
import corsConfig from "./config/cors.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Import Modular Routers with [name].[layer].js convention
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import categoryRouter from "./modules/category/category.routes.js";
import eventRouter from "./modules/event/event.routes.js";
import eventManagerRequestRouter from "./modules/eventManagerRequest/eventManagerRequest.routes.js";
import paymentRouter from "./modules/payment/payment.routes.js";
import ticketRouter from "./modules/ticket/ticket.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsConfig));

// Inject Request ID Context
app.use(requestIdMiddleware);

// JSON Parser
app.use(express.json());

// Routes mapping
app.get("/", (req, res) => {
  res.send("EventifyX Production Modular API is running...");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

// API Version 1 prefix
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/manager-requests", eventManagerRequestRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/tickets", ticketRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
