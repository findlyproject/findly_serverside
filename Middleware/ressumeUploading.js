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
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadConfig = {
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
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (_req, file) => __awaiter(void 0, void 0, void 0, function* () {
        if (!uploadConfig[file.fieldname]) {
            throw new Error("Invalid file field name");
        }
        return uploadConfig[file.fieldname];
    }),
});
const upload = (0, multer_1.default)({ storage }).fields([
    { name: "resume", maxCount: 1 },
    { name: "video", maxCount: 1 },
]);
exports.default = upload;
