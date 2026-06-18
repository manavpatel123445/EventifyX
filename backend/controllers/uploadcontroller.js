import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate Cloudinary configuration exists
    const hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    if (!hasCloudinaryConfig) {
      return res.status(500).json({ success: false, message: 'Cloudinary is not configured on the server' });
    }

    // Validate basic constraints
    if (!/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      return res.status(400).json({ success: false, message: 'Image too large (max 10MB)' });
    }

    // 🛡️ Restrict upload folder to a safe whitelist
    const allowedFolders = ["eventifyx/events", "eventifyx/profiles", "eventifyx/categories"];
    const requestedFolder = req.body?.folder && String(req.body.folder);
    const folder = allowedFolders.includes(requestedFolder) ? requestedFolder : "eventifyx/events";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      stream.end(file.buffer);
    });

    const url = result.secure_url;
    return res.json({ success: true, url });
  } catch (error) {
    console.error('[uploadImage] error:', error);
    const message = error?.message || 'Upload failed';
    res.status(500).json({ success: false, message });
  }
};