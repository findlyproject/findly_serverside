import { Request, Response } from "express";
import cloudinary from "cloudinary";
import { CustomError } from "./errorHandler";

export const generateSignedUrl =async (req: Request, res: Response):Promise<void>=> {
  try {
    const { fileType } = req.query as { fileType?: string };

    if (!fileType) {
      throw new CustomError("Missing fileType parameter",400);

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
      status:true,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "uploads",
      timestamp,
      signature, 
    });
  } catch (error) {
    throw new CustomError("Internal Server Error",500);
  }
};
