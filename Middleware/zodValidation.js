"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = validateData;
const zod_1 = require("zod");
const errorHandler_1 = require("../Utils/errorHandler");
function validateData(bodySchema, paramSchema) {
    return (req, _res, next) => {
        try {
            if (paramSchema) {
                paramSchema.parse(req.params); // Validate params
            }
            if (bodySchema) {
                bodySchema.parse(req.body); // Validate body
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new errorHandler_1.CustomError(`Invalid data!!!!!!!!!!, ${error.errors[0].path}: ${error.errors[0].message}`, 400);
            }
            throw new errorHandler_1.CustomError("Error when validating data", 400);
        }
    };
}
