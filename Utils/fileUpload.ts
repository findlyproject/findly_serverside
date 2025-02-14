import { Request, Response } from "express";
import cloudinary from "cloudinary";

export const generateSignedUrl =async (req: Request, res: Response):Promise<void>=> {
  try {
    const { fileType } = req.query as { fileType?: string };

    if (!fileType) {
      res.status(400).json({sttaus: false, error: "Missing fileType parameter" });
      return;
    }

    const timestamp: number = Math.round(new Date().getTime() / 1000); 

    const paramsToSign = {
      timestamp,
      folder: "uploads",
    };

    const signature: string = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    res.json({
      api_key: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "uploads",
      timestamp,
      signature, 
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};
