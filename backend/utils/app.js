import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "../db.js";

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

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default app;