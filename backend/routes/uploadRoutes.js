import express from 'express';
import multer from 'multer';
import { uploadBufferToCloudinary } from '../utils/fileUpload.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer();

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'misc';
    const fileUrl = await uploadBufferToCloudinary(req.file.buffer, `eventifyx/${folder}`);
    
    res.json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

export default router;
