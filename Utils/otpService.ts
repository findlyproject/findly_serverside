// otpService.ts
import nodemailer from "nodemailer";
import { generateOTP } from "./otpGenerator";

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",  // You can change this to any email provider
  auth: {
    user: process.env.APP_EMAIL, // Your email (e.g., "your-email@gmail.com")
    pass: process.env.APP_PASSWORD, // Your email password or app-specific password
  },
});

console.log("ddd",process.env.APP_EMAIL);


// Function to send OTP via email
export const sendOTP = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.APP_EMAIL, 
    to: email,                   // recipient address
    subject: "Your OTP for Registration",  // Email subject
    text: `Your OTP is: ${otp}. Please use this to complete your registration.`, // Email body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};


export const sendOTPViaSMS = async (contact: string, otp: string): Promise<void> => {
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;  
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}. Please use this to complete your registration.`,
      from: process.env.TWILIO_PHONE_NUMBER, 
      to: contact, 
    });
    console.log(`OTP sent to ${contact}`);
  } catch (error) {
    console.error("Error sending OTP SMS:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};
 