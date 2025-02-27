
import { Request, Response } from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export const generateSignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileType } = req.query as { fileType?: string };
console.log("fileType",fileType);

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
    const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    res.json({
      status: true,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      timestamp,
      signature,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
