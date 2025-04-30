"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
// otpGenerator.ts
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    return otp.toString();
};
exports.generateOTP = generateOTP;
