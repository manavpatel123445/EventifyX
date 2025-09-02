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
// Load environment variables
dotenv.config();
db();

const app = express();
app.use(cors());
app.use(express.json());


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


export default app;