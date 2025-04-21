// otpService.ts
import nodemailer from "nodemailer";
import { generateOTP } from "./otpGenerator";

export const sendOTP = async (email: string, otp: string): Promise<void> => {

  const transporter = nodemailer.createTransport({
  
  
    service: "gmail",  
    auth: {
      user: process.env.APP_EMAIL, 
      pass: process.env.APP_PASSWORD, 
    },
  });
  const mailOptions = {
    from: process.env.APP_EMAIL, 
    to: email,          
    subject: "Your OTP for Registration",  
    text: `Your OTP is: ${otp}. Please use this to complete your registration.`, 
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
   
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
 