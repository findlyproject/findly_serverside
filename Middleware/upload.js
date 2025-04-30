"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary credentials in .env file");
}
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (_req, file) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Uploading: ${file.originalname} - Field: ${file.fieldname}`);
        console.log("files,files", file);
        const uploadConfig = {
            profile: { folder: "users/profile", resource_type: "image", allowed_formats: ["png", "jpg", "jpeg"] },
            profileImage: {
                folder: "users/profile",
                resource_type: "image",
                allowed_formats: ["png", "jpg", "jpeg"],
            },
            banner: {
                folder: "users/banner",
                resource_type: "image",
                allowed_formats: ["png", "jpg", "jpeg"],
            },
            media: {
                folder: "posts/media",
                resource_type: "auto",
                allowed_formats: ["png", "jpg", "jpeg", "mp4", "mov", "avi", "mkv"],
            },
            logo: {
                folder: "logo",
                resource_type: "image",
                allowed_formats: ["png", "jpg", "jpeg"],
            },
        };
        if (!uploadConfig[file.fieldname]) {
            throw new Error(`Invalid file field name: ${file.fieldname}`);
        }
        return uploadConfig[file.fieldname]; // ✅ Returns correct upload settings
    }),
});
const multerInstance = (0, multer_1.default)({ storage });
exports.upload = multerInstance;
// import dotenv from "dotenv";
// import multer, { Multer } from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { v2 as cloudinary } from "cloudinary";
// dotenv.config(); // Load environment variables
// // Ensure Cloudinary credentials exist
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//   throw new Error("Missing Cloudinary credentials in .env file");
// }
// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // Define Cloudinary Storage
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (_req, file) => {
//     console.log(`Uploading: ${file.originalname} - Field: ${file.fieldname}`);
// console.log("files,files",file);
//     const uploadConfig: Record<string, { folder: string; resource_type: string; allowed_formats: string[] }> = {
//       profileImage: {
//         folder: "users/profile",
//         resource_type: "image",
//         allowed_formats: ["png", "jpg", "jpeg"],
//       },
//       banner: {
//         folder: "users/banner",
//         resource_type: "image",
//         allowed_formats: ["png", "jpg", "jpeg"],
//       },
//       media: {
//         folder: "posts/media",
//         resource_type: "auto",
//         allowed_formats: ["png", "jpg", "jpeg", "mp4", "mov", "avi", "mkv"],
//       }, // ✅ Fix: Properly closed media object
//     };
//     console.log("upload multer",uploadConfig[file.fieldname])
//     if (!uploadConfig[file.fieldname]) {
//       throw new Error(`Invalid file field name: ${file.fieldname}`);
//     }
//     return uploadConfig[file.fieldname]; // ✅ Returns correct upload settings
//   },
// });
// const multerInstance: Multer = multer({ storage });
// export const upload = multerInstance;
