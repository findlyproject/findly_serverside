import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log("multer", file);
    return {
      folder: "profile_uploads", // Folder name in Cloudinary
      format: file.mimetype.split("/")[1], // Dynamically set format
    };
  },
});

const uploadd = multer({ storage });

export { uploadd };
