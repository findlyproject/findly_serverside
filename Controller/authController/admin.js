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
exports.ProfileEdit = exports.logout = exports.login = void 0;
const AdminSchema_1 = require("../../model/AdminSchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const errorHandler_1 = require("../../Utils/errorHandler");
//login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_1.CustomError("email and password is missing", 404);
    }
    const findAdmin = yield AdminSchema_1.Admin.findOne({ email });
    if (!findAdmin) {
        throw new errorHandler_1.CustomError("Admin not found", 404);
    }
    const isMatch = yield bcrypt_1.default.compare(password, findAdmin.password);
    if (!isMatch) {
        throw new errorHandler_1.CustomError("password not match", 404);
    }
    const adminToken = jsonwebtoken_1.default.sign({ id: findAdmin._id, email: findAdmin.email }, process.env.USER_SECRETKEY, { expiresIn: "2d" });
    res.cookie("adminToken", adminToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ status: true, message: "Admin login successful", findAdmin });
});
exports.login = login;
// logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ status: true, message: "Admin logout sucssesfully" });
});
exports.logout = logout;
//profile edit
const ProfileEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstName, lastName, bio, phoneNumber, email, password } = req.body;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!adminId) {
        throw new errorHandler_1.CustomError("Admin ID is missing", 400);
    }
    const admin = yield AdminSchema_1.Admin.findById(adminId);
    if (!admin) {
        throw new errorHandler_1.CustomError("Admin not found", 404);
    }
    if (firstName)
        admin.firstName = firstName;
    if (lastName)
        admin.lastName = lastName;
    if (bio)
        admin.bio = bio;
    if (phoneNumber)
        admin.phoneNumber = phoneNumber;
    if (req.file) {
        admin.profileImage = req.file.path; // Cloudinary will return a URL in req.file.path
    }
    if (email) {
        admin.email = email;
    }
    if (password) {
        const salt = yield bcrypt_1.default.genSalt(10);
        admin.password = yield bcrypt_1.default.hash(password, salt);
    }
    yield admin.save();
    res.status(200).json({ status: true, message: "Profile updated successfully", admin });
});
exports.ProfileEdit = ProfileEdit;
