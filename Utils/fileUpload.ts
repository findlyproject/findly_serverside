import { Request, Response } from "express";
import cloudinary from "cloudinary";

export const generateSignedUrl =async (req: Request, res: Response):Promise<void>=> {
  try {
    const { fileType } = req.query as { fileType?: string };

    if (!fileType) {
      res.status(400).json({ error: "Missing fileType parameter" });
      return;
    }

    const timestamp: number = Math.round(new Date().getTime() / 1000); // Current timestamp

    const paramsToSign = {
      timestamp,
      folder: "uploads", // Ensure this matches frontend
    };

    // 🔹 Generate signature using API secret
    const signature: string = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    res.json({
      api_key: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "uploads",
      timestamp,
      signature, // Signed correctly using API_SECRET
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
