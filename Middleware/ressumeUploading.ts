import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadConfig: Record<string, { folder: string; resource_type: string; allowed_formats: string[] }> = {
  resume: {
    folder: "users/resume",
    resource_type: "auto",
    allowed_formats: ["pdf"],
  },
  
  video: {
    folder: "users/video",
    resource_type: "video",
    allowed_formats: ["mp4", "avi", "mov"],
  },
};
console.log("uploadConfig",uploadConfig);


const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
  console.log("file On multer",file);
  
    if (!uploadConfig[file.fieldname]) {
      throw new Error("Invalid file field name");
    }
    return uploadConfig[file.fieldname];
  },
});

const upload = multer({ storage }).fields([
  { name: "resume", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

export default upload;
