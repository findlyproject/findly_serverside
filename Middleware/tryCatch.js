"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorCatch = void 0;
const errorCatch = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((err) => next(err));
    };
};
exports.errorCatch = errorCatch;
