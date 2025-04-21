"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../Controller/ratingController/user");
const tryCatch_1 = require("../middleware/tryCatch");
const userauthantication_1 = require("../middleware/userauthantication");
const zodValidation_1 = require("../middleware/zodValidation");
const zodSchema_1 = require("../Utils/zodSchema");
const company_1 = require("../Controller/ratingController/company");
const ratingRouter = express_1.default.Router();
exports.ratingRouter = ratingRouter;
ratingRouter
    .post("/createreview", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.RatingSchema), (0, tryCatch_1.errorCatch)(user_1.createRating))
    .get("/findreviews", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_1.findreviewsBycompany))
    .get("/findallreviews", (0, tryCatch_1.errorCatch)(user_1.getAllRatings))
    .get("/:userId", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(undefined, zodSchema_1.IdSchema), (0, tryCatch_1.errorCatch)(user_1.getUserRatings));
