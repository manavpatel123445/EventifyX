import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "../db.js";
import categoryRouter from "../routers/categoryRouters.js";

dotenv.config();
db();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
//app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("EventifyX API is running...");
});

app.use("/api/categories", categoryRouter);

export default app;