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
exports.sendOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail', // Use your email service (e.g., 'gmail', 'outlook', etc.)  
        auth: {
            user: process.env.APP_EMAIL, // Your email address
            pass: process.env.APP_PASSWORD, // Your email password or app-specific password
        },
    });
    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('OTP sent to:', email);
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Error sending OTP. Please try again later.');
    }
});
exports.sendOTP = sendOTP;
