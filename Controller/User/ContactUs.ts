//CONTACT US
import nodemailer from "nodemailer";
import { Request, Response } from "express";

const EmailUs = async (req: Request, res: Response): Promise<void> => {
  const { email, message } = req.body;
  if (!email || !message) {
    res
      .status(400)
      .json({ status: "failed", message: "Email and message are required." });
    return;
  }
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ status: "failed", message: "Invalid email format" });
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
    .json({ status: "success", message: "Email sent successfully", info });
};

export { EmailUs };
