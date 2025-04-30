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
exports.subscriptionAuthentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../Utils/errorHandler");
const subscriptionAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.subscriptionToken;
        if (!token) {
            throw new errorHandler_1.CustomError("subscriptionToken token missing", 401);
        }
        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
            throw new errorHandler_1.CustomError(" subscription Secret key is missing", 500);
        }
        const a = jsonwebtoken_1.default.verify(token, secretKey, (error, user) => {
            if (error) {
                throw new errorHandler_1.CustomError(`Invalid token ${error}`, 401);
            }
            req.user = user;
            next();
        });
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.subscriptionAuthentication = subscriptionAuthentication;
