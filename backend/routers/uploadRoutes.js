import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadcontroller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { apiLimiter, strictLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
    fields: 10
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.match(/(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Error handler for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
  next();
};

// Protected image upload endpoint with rate limiting
router.post(
  "/image", 
  protect,                    // Require authentication
  apiLimiter,                // Apply rate limiting
  upload.single("file"),     // Handle single file upload
  handleUploadError,         // Handle upload errors
  uploadImage                // Process the upload
);

export default router;


