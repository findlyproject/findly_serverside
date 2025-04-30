"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../Utils/errorHandler");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errorHandler_1.CustomError) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errorCode: err.errorCode,
        });
    }
    console.error(`Unexpected Error: ${err}`);
    res.status(500).json({ status: "error", message: "Something went wrong!", });
};
exports.default = errorHandler;
