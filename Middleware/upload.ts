import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// Ensure .env variables are correctly loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary credentials in .env file");
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

// Define Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    console.log(`Uploading file: ${file.originalname} - Field: ${file.fieldname}`);

    if (!file.mimetype) {
      throw new Error("Invalid file type");
    }

    if (file.fieldname === "videoFile") {
      return {
        folder: "movies/video",
        resource_type: "video",
        allowed_formats: ["mp4", "avi", "mov", "mkv"],
      };
    } 
    
    if (file.fieldname === "imageFile") {
      return {
        folder: "movies/images",
        resource_type: "image",
        allowed_formats: ["png", "jpg", "jpeg"],
      };
    }

    throw new Error("Invalid file field name");
  },
});

// Multer Upload Middleware
const upload = multer({ storage }).fields([
  { name: "videoFile", maxCount: 1 },
  { name: "imageFile", maxCount: 1 },
]);

export { upload };
