"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode = 500, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
