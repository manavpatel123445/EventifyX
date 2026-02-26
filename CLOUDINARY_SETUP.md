# Cloudinary Setup for EventifyX

## Creating Upload Preset

To enable image uploads, you need to create an upload preset in your Cloudinary account:

### Steps:

1. **Log in to Cloudinary Console**
   - Go to https://cloudinary.com/console
   - Login with your account

2. **Navigate to Settings**
   - Click on the gear icon (Settings) in the top right
   - Go to "Upload" tab

3. **Create Upload Preset**
   - Scroll down to "Upload presets" section
   - Click "Add upload preset"
   - Set the following:
     - **Preset name**: `eventifyx_preset`
     - **Signing Mode**: `Unsigned` (for client-side uploads)
     - **Folder**: `eventifyx/events` (optional, for organization)
     - **Allowed formats**: `jpg,jpeg,png,gif,webp`
     - **Max file size**: `10485760` (10MB in bytes)
     - **Max image width**: `1920` (optional)
     - **Max image height**: `1080` (optional)
     - **Quality**: `auto:good` (for automatic optimization)

4. **Save the Preset**
   - Click "Save"

### Alternative: Signed Uploads (More Secure)

If you prefer server-side uploads (more secure):

1. Set **Signing Mode** to `Server-side`
2. Create an API endpoint in your backend for handling uploads
3. Update the `uploadImage` function in `eventService.ts` to use your backend endpoint

### Environment Variables

Make sure you have these in your frontend environment (if needed):
```
VITE_CLOUDINARY_CLOUD_NAME=dutfzuuq5
VITE_CLOUDINARY_UPLOAD_PRESET=eventifyx_preset
```

### Backend Upload Endpoint (Optional)

If you want server-side uploads, add this to your backend:

```javascript
// In a new file: backend/controllers/uploadController.js
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
```

### Testing

1. Try uploading an image through the create event form
2. Check if the image appears in your Cloudinary Media Library
3. Verify the image URL is correctly saved in the event request

## Current Setup Status

✅ Cloudinary account configured in backend (.env)
⏳ Upload preset needs to be created (follow steps above)
⏳ Frontend upload component ready to use

Your cloud name: `dutfzuuq5`
