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
exports.verifyOtp = exports.requestDeleteAccount = exports.findUsers = exports.resetPasword = exports.sendOtp = exports.refreshAccessToken = exports.AllUsersEmailCheck = exports.googleauthlogin = exports.logout = exports.login = exports.RegistrationUser = void 0;
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../../Utils/errorHandler");
const nodemailer_1 = __importDefault(require("nodemailer"));
const otpGenerator_1 = require("../../Utils/otpGenerator");
// import { sendOTP } from "../../Utils/mailer";
const otpService_1 = require("../../Utils/otpService");
const OTP_EXPIRATION_TIME = 2 * 60 * 1000;
const otpStore = {};
//Registration
const RegistrationUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, education, location, jobTitles, jobLocations, gender } = req.body;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        throw new errorHandler_1.CustomError("Invalid email format", 400);
    }
    const existingUser = yield UserSchema_1.default.findOne({ email, isDeleted: false });
    if (existingUser) {
        throw new errorHandler_1.CustomError("User already exists", 400);
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = new UserSchema_1.default({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        education: education || [],
        location,
        gender,
        jobTitle: jobTitles,
        jobLocation: jobLocations,
    });
    yield user.save();
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, type: "User", }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, type: "User", }, process.env.USER_SECRETKEY, { expiresIn: "7d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie(`type`, "User", {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
    });
    res
        .status(200)
        .json({ status: true, message: "Registration successful", user });
});
exports.RegistrationUser = RegistrationUser;
//login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log("hello annuuuu");
    const logeduser = yield UserSchema_1.default.findOne({ email, isDeleted: false }).populate("connecting.connectionID");
    if (!logeduser) {
        throw new errorHandler_1.CustomError("email id is wrong", 404);
    }
    const verfyuser = yield bcrypt_1.default.compare(password, logeduser.password);
    if (!verfyuser) {
        throw new errorHandler_1.CustomError("password is wrong", 404);
    }
    const currentDate = new Date();
    if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {
        if (logeduser.subscriptionEndDate < currentDate) {
            logeduser.role = "user";
            logeduser.subscriptionStartDate = null;
            logeduser.subscriptionEndDate = null;
            yield logeduser.save();
        }
    }
    if (verfyuser) {
        const token = jsonwebtoken_1.default.sign({
            id: logeduser._id,
            email: logeduser.email,
            type: "User",
            isBlocked: logeduser.isBlocked,
        }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: logeduser._id, email: logeduser.email, type: "User", }, process.env.USER_SECRETKEY, { expiresIn: "7d" });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie(`type`, "User", {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'none',
        });
    }
    if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {
        const subscriptionEndDate = logeduser.subscriptionEndDate
            ? new Date(logeduser.subscriptionEndDate)
            : null;
        if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
            const currentDate = new Date();
            const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
            const normalizedEndDate = startOfDay(subscriptionEndDate);
            const normalizedCurrentDate = startOfDay(currentDate);
            const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime();
            const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
            if (remainingValidityDays > 0) {
                const payload = {
                    userId: logeduser._id,
                    email: logeduser.email,
                    role: logeduser.role,
                    remainingValidityDays,
                };
                const secretKey = process.env.USER_SECRETKEY;
                const subscriptionToken = jsonwebtoken_1.default.sign(payload, secretKey, {
                    expiresIn: `${remainingValidityDays}d`,
                });
                res.cookie("subscriptionToken", subscriptionToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
                });
            }
            else {
                throw new errorHandler_1.CustomError("Your premium membership has expired. Please renew to continue enjoying premium benefits.", 403);
            }
        }
        else {
            console.error("Invalid subscription end date");
        }
    }
    res
        .status(200)
        .json({ status: true, message: "Login successful", logeduser });
});
exports.login = login;
//logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        const user = yield UserSchema_1.default.findById(userId);
        if (user && user.role === "premium" && user.subscriptionEndDate) {
            const currentDate = new Date();
            if (user.subscriptionEndDate < currentDate) {
                user.role = "user";
                user.subscriptionStartDate = null;
                user.subscriptionEndDate = null;
                yield user.save();
            }
        }
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("subscriptionToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("type", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ status: true, message: "Logout successfully" });
});
exports.logout = logout;
//google auth login
const googleauthlogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, image } = req.body;
    if (!name && !email) {
        throw new errorHandler_1.CustomError("name or email is missing", 404);
    }
    const finduser = yield UserSchema_1.default.findOne({ email });
    if (finduser) {
        const token = jsonwebtoken_1.default.sign({
            id: finduser._id,
            email: finduser.email,
            isBlocked: finduser.isBlocked,
        }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
        const currentDate = new Date();
        if (finduser.role === "premium" && finduser.subscriptionEndDate) {
            if (finduser.subscriptionEndDate < currentDate) {
                finduser.role = "user";
                finduser.subscriptionStartDate = null;
                finduser.subscriptionEndDate = null;
                yield finduser.save();
            }
        }
        if (finduser.role === "premium" && finduser.subscriptionEndDate) {
            const subscriptionEndDate = finduser.subscriptionEndDate
                ? new Date(finduser.subscriptionEndDate)
                : null;
            if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
                const currentDate = new Date();
                const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
                const normalizedEndDate = startOfDay(subscriptionEndDate);
                const normalizedCurrentDate = startOfDay(currentDate);
                const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime();
                const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
                if (remainingValidityDays > 0) {
                    const payload = {
                        userId: finduser._id,
                        email: finduser.email,
                        role: finduser.role,
                        remainingValidityDays,
                    };
                    const secretKey = process.env.USER_SECRETKEY;
                    const subscriptionToken = jsonwebtoken_1.default.sign(payload, secretKey, {
                        expiresIn: `${remainingValidityDays}d`,
                    });
                    res.cookie("subscriptionToken", subscriptionToken, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
                    });
                }
                else {
                    throw new errorHandler_1.CustomError("Your premium membership has expired. Please renew to continue enjoying premium benefits.", 404);
                }
            }
            else {
            }
        }
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: finduser._id,
            email: finduser.email,
            isBlocked: finduser.isBlocked,
        }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: true,
            message: "google auth Login successful",
            finduser,
        });
        return;
    }
    else {
        const user = yield new UserSchema_1.default({
            email,
            firstName: name,
            profileImage: image,
        });
        const savegoogleauth = yield user.save();
        res.status(200).json({
            status: true,
            message: "google auth registration and Login successful",
            savegoogleauth,
        });
    }
});
exports.googleauthlogin = googleauthlogin;
//Email check
const AllUsersEmailCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    const user = yield UserSchema_1.default.findOne({ email });
    if (user) {
        res.json({ exists: true });
        return;
    }
    else {
        res.json({ exists: false });
        return;
    }
});
exports.AllUsersEmailCheck = AllUsersEmailCheck;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new errorHandler_1.CustomError("Refresh token not found please login", 404);
    }
    const secretKey = process.env.USER_SECRETKEY || "default_secret";
    if (!secretKey) {
        throw new errorHandler_1.CustomError("missing secret key", 404);
    }
    jsonwebtoken_1.default.verify(refreshToken, secretKey, (error, decoded) => {
        if (error) {
            throw new errorHandler_1.CustomError("Refresh token invalid", 404);
        }
        if (typeof decoded !== "object" || !decoded) {
            throw new errorHandler_1.CustomError("Invalid token structure", 404);
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, username: decoded.username, email: decoded.email }, secretKey, { expiresIn: "1d" });
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });
        res.status(200).json({ status: true, message: "accessToken created", accessToken });
        return;
    });
});
exports.refreshAccessToken = refreshAccessToken;
/// SEND OTP ///
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    if (!email) {
        throw new errorHandler_1.CustomError("email is not found", 404);
    }
    const user = yield UserSchema_1.default.findOne({ email });
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        throw new errorHandler_1.CustomError("Invalid email format", 400);
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.APP_EMAIL,
        replyTo: email,
        to: email,
        subject: '🔐 Password Reset OTP - Findly',
        text: `Dear User,

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.

If you didn’t request this, please ignore this email.

Findly Support Team`,
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">🔐 Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Dear User,</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password for your <b>Findly</b> account.</p>
        <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="text-align: center; padding: 15px; background-color: #ffcc00; border-radius: 8px; font-size: 22px; font-weight: bold; letter-spacing: 2px;">
            ${otp}
        </div>
        <p style="color: #555; font-size: 16px;">This OTP is valid for <b>10 minutes</b>. Do not share it with anyone for security reasons.</p>
        <p style="color: #555; font-size: 16px;">If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <a href="${process.env.CLIENT_URL}/contactus/contact" style="color: #999; font-size: 14px; text-align: center;">Findly Support Team</a>

    </div>
    `,
    };
    const info = yield transporter.sendMail(mailOptions);
    res
        .status(200)
        .json({ status: true, message: "Otp sent successfully", otp });
});
exports.sendOtp = sendOtp;
///// RESET PASSWORD /////
const resetPasword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.params;
    if (!email) {
        res.status(404).json({ status: false, message: "email is not found" });
    }
    const findUser = yield UserSchema_1.default.findOne({ email: email });
    if (!findUser) {
        res.status(404).json({ status: false, message: "you have no account" });
        return;
    }
    if (!password) {
        res.status(404).json({ status: false, message: "password is not found" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    findUser.password = hashedPassword;
    const updatedUser = yield findUser.save();
    res.status(200).json({ status: true, message: "password updated successfully", updatedUser });
});
exports.resetPasword = resetPasword;
const findUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield UserSchema_1.default.find();
    res.status(200).json({ success: true, message: "users found it ", allUsers });
});
exports.findUsers = findUsers;
const requestDeleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: "user not found" });
        return;
    }
    let email = user.email;
    const otp = (0, otpGenerator_1.generateOTP)();
    console.log("otp", otp);
    otpStore[email] = { otp, createdAt: Date.now() };
    try {
        console.log("otpinn", otp);
        console.log("email", email);
        yield (0, otpService_1.sendOTP)(email, otp);
        res.status(200).json({
            message: "OTP sent to your email. Please verify to proceed.", otp
        });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new errorHandler_1.CustomError("Error sending OTP. Please try again later.", 500);
    }
});
exports.requestDeleteAccount = requestDeleteAccount;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { otp, reasons } = req.body;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: "user not found" });
        return;
    }
    const email = user === null || user === void 0 ? void 0 : user.email;
    if (Date.now() - ((_b = otpStore[email]) === null || _b === void 0 ? void 0 : _b.createdAt) > OTP_EXPIRATION_TIME) {
        delete otpStore[email];
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
    }
    if (((_c = otpStore[email]) === null || _c === void 0 ? void 0 : _c.otp) !== otp.toString()) {
        throw new errorHandler_1.CustomError("Invalid OTP. Please try again.", 400);
    }
    if (user && user.role === "premium" && user.subscriptionEndDate) {
        const currentDate = new Date();
        if (user.subscriptionEndDate < currentDate) {
            user.role = "user";
            user.subscriptionStartDate = null;
            user.subscriptionEndDate = null;
            yield user.save();
        }
    }
    user.isDeleted = true;
    user.deletionReasons = reasons;
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("subscriptionToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("type", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    yield user.save();
    res.status(200).json({ success: true, message: "successfully deleted" });
});
exports.verifyOtp = verifyOtp;
