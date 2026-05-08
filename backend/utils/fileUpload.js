import cloudinary from '../config/cloudinary.js';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

export const uploadToCloudinary = async (file, folder = 'eventifyx') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      public_id: `${folder}_${randomUUID()}`,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const uploadBufferToCloudinary = async (buffer, folder = 'eventifyx') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: `${folder}_${randomUUID()}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading buffer to Cloudinary:', error);
          return reject(new Error('Failed to upload file to Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );

    const bufferStream = Readable.from(buffer);
    bufferStream.pipe(uploadStream);
  });
};
