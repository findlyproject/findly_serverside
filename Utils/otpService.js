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
exports.sendOTPViaSMS = exports.sendOTP = void 0;
// otpService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Failed to send OTP. Please try again later.");
    }
});
exports.sendOTP = sendOTP;
const sendOTPViaSMS = (contact, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    try {
        yield client.messages.create({
            body: `Your OTP is: ${otp}. Please use this to complete your registration.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact,
        });
        console.log(`OTP sent to ${contact}`);
    }
    catch (error) {
        console.error("Error sending OTP SMS:", error);
        throw new Error("Failed to send OTP. Please try again later.");
    }
});
exports.sendOTPViaSMS = sendOTPViaSMS;
