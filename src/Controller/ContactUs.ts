
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { CustomError } from "../Utils/errorHandler";

export const EmailUs = async (req: Request, res: Response): Promise<void> => {
  const { email, message } = req.body;
  if (!email || !message) {
  
    throw new CustomError("Email and message are required")
  }
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new CustomError("Invalid email format" ,400)
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL as string,
      pass: process.env.APP_PASSWORD as string,
    },
  });

  const mailOptions = {
    from: email,
    replyTo: email,
    to: process.env.APP_EMAIL as string,
    subject: `Seeking a Help`,
    text: message,
  };

  const info = await transporter.sendMail(mailOptions);

  res
    .status(200)
    .json({ status:true, message: "Email sent successfully", info });
};
