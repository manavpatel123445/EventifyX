import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eventifyx/events",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  },
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid image format. Supported: jpg, jpeg, png, gif, webp"), false);
  }
};

export const uploadCloudinary = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export const uploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export default { uploadCloudinary, uploadMemory };
