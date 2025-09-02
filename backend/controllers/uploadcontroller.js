import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'eventifyx/events',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        max_bytes: 10485760 // 10MB
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Upload failed' });
        }
        res.json({ url: result.secure_url });
      }
    );

    result.end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};