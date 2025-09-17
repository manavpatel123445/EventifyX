import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadcontroller.js";

const router = express.Router();

// Memory storage; files are streamed to Cloudinary in controller
const upload = multer({ storage: multer.memoryStorage() });

// Accept field name 'file' (matches frontend FormData)
router.post("/image", upload.single("file"), uploadImage);

export default router;


