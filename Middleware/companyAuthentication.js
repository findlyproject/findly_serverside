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
exports.companyAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../Utils/errorHandler");
const companyAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.ctoken;
        if (!token) {
            res.status(401).json({ status: false, message: "Authentication token missing" });
            return;
        }
        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
            throw new errorHandler_1.CustomError("missing secret key", 404);
        }
        yield jsonwebtoken_1.default.verify(token, secretKey, (error, company) => {
            if (error) {
                throw new errorHandler_1.CustomError("Invalid token", 401);
            }
            req.company = company;
            next();
        });
    }
    catch (error) {
        res.status(400).json({ status: false, message: "Internal server error" });
        return;
    }
});
exports.companyAuthMiddleware = companyAuthMiddleware;
