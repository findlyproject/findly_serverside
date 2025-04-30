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
exports.verifyOtp = exports.requestDeleteAccount = exports.resetPasword = exports.sendOtp = exports.logOut = exports.login = exports.finalRegister = exports.verifyOTP = exports.initialRegister = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CompanySchema_1 = require("../../model/CompanySchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const otpService_1 = require("../../Utils/otpService");
const otpGenerator_1 = require("../../Utils/otpGenerator");
const nodemailer_1 = __importDefault(require("nodemailer"));
const SubscriptionSchema_1 = require("../../model/SubscriptionSchema");
const OTP_EXPIRATION_TIME = 2 * 60 * 1000;
const otpStore = {};
const initialRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    const existingCompany = yield CompanySchema_1.Company.findOne({ email });
    if (existingCompany) {
        throw new errorHandler_1.CustomError("Company already exists", 400);
    }
    const otp = (0, otpGenerator_1.generateOTP)();
    otpStore[email] = { otp, createdAt: Date.now() };
    yield (0, otpService_1.sendOTP)(email, otp);
    res.status(200).json({
        message: "OTP sent to your email. Please verify to proceed.",
    });
});
exports.initialRegister = initialRegister;
// Step 2: OTP Verification
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { otp, email } = req.body;
    if (((_a = otpStore[email]) === null || _a === void 0 ? void 0 : _a.otp) !== otp.toString()) {
        throw new errorHandler_1.CustomError("Invalid OTP. Please try again.", 400);
    }
    res.status(200).json({
        message: "OTP verified successfully. Please proceed to fill the registration form.",
    });
    delete otpStore[email];
});
exports.verifyOTP = verifyOTP;
// Step 3: Final Registration Form Submission
const finalRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, founder, foundedAt, password, contact, IndustryType, address, } = req.body;
    console.log(name);
    const existingCompany = yield CompanySchema_1.Company.findOne({ email });
    if (existingCompany) {
        throw new errorHandler_1.CustomError("Company already exists", 400);
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const logo = req.file ? req.file.path : "";
    if (!logo) {
        throw new errorHandler_1.CustomError("logo is required", 404);
    }
    const company = new CompanySchema_1.Company({
        name,
        logo,
        email,
        founder,
        foundedAt,
        password: hashedPassword,
        contact,
        IndustryType,
        address,
        type: "Company",
    });
    yield company.save();
    const token = jsonwebtoken_1.default.sign({ id: company._id, email: company.email, type: "Company" }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: company._id, email: company.email, type: "Company" }, process.env.USER_SECRETKEY, { expiresIn: "7d" });
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
    res.cookie(`type`, "Company", {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
    });
    res
        .status(201)
        .json({
        status: true,
        message: "Company registered successfully",
        company,
    });
});
exports.finalRegister = finalRegister;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const company = yield CompanySchema_1.Company.findOne({ email }).populate("employees.employee");
    console.log("company", company);
    if (!company) {
        throw new errorHandler_1.CustomError(`No account found for ${email}`, 401);
    }
    const verfyPassword = yield bcrypt_1.default.compare(password, company.password);
    if (!verfyPassword) {
        throw new errorHandler_1.CustomError("password is wrong", 404);
    }
    const currentDate = new Date();
    const subscription = yield SubscriptionSchema_1.SubscriptionPlan.find({ companyId: company._id, isDeleted: false });
    console.log("kaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", subscription);
    if (subscription.length === 0) {
        company.role = "company";
        company.subscriptionStartDate = null;
        company.subscriptionEndDate = null;
        yield company.save();
        console.log("roliooos", company.role);
    }
    else if (company.role === "premium" && company.subscriptionEndDate) {
        if (company.subscriptionEndDate < currentDate) {
            company.role = "company";
            company.subscriptionStartDate = null;
            company.subscriptionEndDate = null;
            yield company.save();
        }
    }
    if (verfyPassword) {
        const token = jsonwebtoken_1.default.sign({
            id: company._id,
            email: company.email,
            type: "Company",
        }, process.env.USER_SECRETKEY, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: company._id, email: company.email, type: "Company" }, process.env.USER_SECRETKEY, { expiresIn: "7d" });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie(`type`, "Company", {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
        });
    }
    if (subscription.length > 0) {
        if (company.role === "premium" && company.subscriptionEndDate) {
            const subscriptionEndDate = company.subscriptionEndDate
                ? new Date(company.subscriptionEndDate)
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
                        userId: company._id,
                        email: company.email,
                        role: company.role,
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
    }
    res.status(200).json({ status: true, message: "Login successful", company });
});
exports.login = login;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
    if (companyId) {
        const company = yield CompanySchema_1.Company.findById(companyId);
        if (company && company.role === "premium" && company.subscriptionEndDate) {
            const currentDate = new Date();
            if (company.subscriptionEndDate < currentDate) {
                company.role = "company";
                company.subscriptionStartDate = null;
                company.subscriptionEndDate = null;
                yield company.save();
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
exports.logOut = logOut;
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    if (!email) {
        throw new errorHandler_1.CustomError("email is not found", 404);
    }
    const company = yield CompanySchema_1.Company.findOne({ email });
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
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
        subject: "🔐 Password Reset OTP - Findly",
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
    res.status(200).json({ status: true, message: "Otp sent successfully", otp });
});
exports.sendOtp = sendOtp;
const resetPasword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.params;
    if (!email) {
        res.status(404).json({ status: false, message: "email is not found" });
    }
    console.log("email", email);
    const findCompany = yield CompanySchema_1.Company.findOne({ email: email });
    if (!findCompany) {
        res.status(404).json({ status: false, message: "you have no account" });
        return;
    }
    if (!password) {
        res.status(404).json({ status: false, message: "password is not found" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    findCompany.password = hashedPassword;
    const updatedUser = yield findCompany.save();
    res.status(200).json({ status: true, message: "password updated successfully", updatedUser });
});
exports.resetPasword = resetPasword;
const requestDeleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const comapanyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const company = yield CompanySchema_1.Company.findById(comapanyId);
    if (!company) {
        res.status(404).json({ success: false, message: "company not found" });
        return;
    }
    let email = company.email;
    const otp = (0, otpGenerator_1.generateOTP)();
    console.log("otp", otp);
    otpStore[email] = { otp, createdAt: Date.now() };
    try {
        console.log("otpinn", otp);
        console.log("email", email);
        console.log("otpStore[email]", otpStore[email]);
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
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { otp, reasons } = req.body;
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        res.status(404).json({ success: false, message: "company not found" });
        return;
    }
    const email = company === null || company === void 0 ? void 0 : company.email;
    if (Date.now() - ((_b = otpStore[email]) === null || _b === void 0 ? void 0 : _b.createdAt) > OTP_EXPIRATION_TIME) {
        delete otpStore[email];
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
    }
    if (((_c = otpStore[email]) === null || _c === void 0 ? void 0 : _c.otp) !== otp.toString()) {
        throw new errorHandler_1.CustomError("Invalid OTP. Please try again.", 400);
    }
    if (company && company.role === "premium" && company.subscriptionEndDate) {
        const currentDate = new Date();
        if (company.subscriptionEndDate < currentDate) {
            company.role = "company";
            company.subscriptionStartDate = null;
            company.subscriptionEndDate = null;
            yield company.save();
        }
    }
    company.isDeleted = true;
    company.deletionReasons = reasons;
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
    yield company.save();
    res.status(200).json({ success: true, message: "successfully deleted" });
});
exports.verifyOtp = verifyOtp;
