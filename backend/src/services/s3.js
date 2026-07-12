import { v2 as cloudinary } from "cloudinary";
import config from "../config/environment.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const s3Service = {
  /**
   * Uploads a file buffer to Cloudinary
   * @param {Buffer} buffer - File buffer
   * @param {string} folder - Destination folder whitelist
   * @returns {Promise<string>} Secure URL of uploaded image
   */
  uploadBuffer: async (buffer, folder = "eventifyx/events") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  },

  /**
   * Deletes a file from Cloudinary using publicId
   * @param {string} publicId - Cloudinary public asset ID
   */
  deleteFile: async (publicId) => {
    return cloudinary.uploader.destroy(publicId);
  },
};

export default s3Service;
