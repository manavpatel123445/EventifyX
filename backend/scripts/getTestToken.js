import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
    if (!process.env.MONGODB_URL) {
        console.log("ERROR: MONGODB_URL mapping missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        
        let user = await User.findOne({ role: "admin" });
        if (!user) {
            user = await User.findOne({ role: "event_manager" });
        }
        if (!user) {
            user = await User.findOne();
        }

        if (!user) {
            console.log("No users exist in the database yet. Please register a user first.");
            process.exit(0);
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            console.log("ERROR: ACCESS_TOKEN_SECRET or JWT_SECRET must be set in .env");
            process.exit(1);
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            secret,
            { expiresIn: "3d" }
        );
        
        console.log(`\n===========================================`);
        console.log(`✅ TEST JWT GENERATED SUCCESSFULLY`);
        console.log(`👤 User Email: ${user.email}`);
        console.log(`👑 User Role:  ${user.role}`);
        console.log(`🔑 Access Token:`);
        console.log(`\n${token}\n`);
        console.log(`===========================================\n`);

    } catch (err) {
        console.error("Database connection failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
