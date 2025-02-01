import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);

// Define Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file): Promise<{ folder: string; resource_type: string; allowed_formats: string[] }> => {
    try {
      console.log(file.fieldname);
      let params: { folder: string; resource_type: string; allowed_formats: string[] };

      if (file.fieldname === "videoFile") {
        console.log("Uploading Video...");
        params = {
          folder: "movies/video",
          resource_type: "video",
          allowed_formats: ["mp4", "avi", "mov", "mkv"],
        };
      } else if (file.fieldname === "imageFile") {
        console.log("Uploading Image...");
        params = {
          folder: "movies/images",
          resource_type: "image",
          allowed_formats: ["png", "jpg", "jpeg"],
        };
      } else {
        throw new Error("Invalid file field name");
      }

      return params;
    } catch (error) {
      console.error("Error configuring Cloudinary upload:", error);
      throw new Error("Error configuring Cloudinary upload");
    }
  },
});

// Multer Upload Middleware
const upload = multer({ storage }).fields([
  { name: "videoFile", maxCount: 1 },
  { name: "imageFile", maxCount: 1 },
]);

export { upload };
