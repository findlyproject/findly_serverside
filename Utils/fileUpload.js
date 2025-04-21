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
exports.generateSignedUrl = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateSignedUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileType } = req.query;
        console.log("fileType", fileType);
        if (!fileType) {
            res.status(400).json({ status: false, message: "File type is required" });
            return;
        }
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "uploads";
        if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
            throw new Error("Cloudinary API credentials are missing");
        }
        // Generate the correct signature
        const paramsToSign = { timestamp, folder };
        const signature = cloudinary_1.default.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
        res.json({
            status: true,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder,
            timestamp,
            signature,
        });
    }
    catch (error) {
        console.error("Cloudinary signature error:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});
exports.generateSignedUrl = generateSignedUrl;
