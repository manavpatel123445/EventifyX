import config from "./environment.js";

export const s3Config = {
  cloudinary: {
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  },
  // In the future, AWS S3 configurations can be added here
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || "eventifyx-uploads",
    region: process.env.S3_REGION || "us-east-1",
  }
};

export default s3Config;
