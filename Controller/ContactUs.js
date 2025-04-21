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
exports.EmailUs = void 0;
//CONTACT US
const nodemailer_1 = __importDefault(require("nodemailer"));
const errorHandler_1 = require("../Utils/errorHandler");
const EmailUs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, message } = req.body;
    if (!email || !message) {
        throw new errorHandler_1.CustomError("Email and message are required");
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        throw new errorHandler_1.CustomError("Invalid email format", 400);
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: email,
        replyTo: email,
        to: process.env.APP_EMAIL,
        subject: `Seeking a Help`,
        text: message,
    };
    const info = yield transporter.sendMail(mailOptions);
    res
        .status(200)
        .json({ status: true, message: "Email sent successfully", info });
});
exports.EmailUs = EmailUs;
