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
exports.deleteReview = exports.getAllRatings = exports.getUserRatings = exports.createCompanyRating = exports.createRating = void 0;
const RatingSchema_1 = __importDefault(require("../../model/RatingSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
//adding rating
const createRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { review, starsRating } = req.body;
    if (!review || !starsRating || !userId) {
        throw new errorHandler_1.CustomError("All fields are required.", 400);
    }
    const newRating = new RatingSchema_1.default({
        review,
        starsRating,
        userId,
    });
    yield newRating.save();
    res
        .status(201)
        .json({ success: true, message: "Rating created successfully", newRating });
});
exports.createRating = createRating;
const createCompanyRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { targetedId } = req.params;
    console.log("targetedId", targetedId);
    const { review, starsRating, name, email } = req.body;
    const type = req.user && req.user.type;
    console.log("type", type);
    let userId = type === "User" ? (_a = req.user) === null || _a === void 0 ? void 0 : _a.id : null;
    let companyId = type === "Company" ? (_b = req.user) === null || _b === void 0 ? void 0 : _b.id : null;
    if (!review || !starsRating) {
        throw new errorHandler_1.CustomError("All fields are required.", 400);
    }
    if (!targetedId) {
        res.status(404).json({ success: false, message: "targetId is  not fount" });
        return;
    }
    const newRating = new RatingSchema_1.default({
        review,
        starsRating,
        userId: userId || null,
        companyId: companyId || null,
        targetCompanyId: targetedId,
        name,
        email
    });
    yield newRating.save();
    res.status(201).json({ success: true, message: "rating posted" });
});
exports.createCompanyRating = createCompanyRating;
//get user rating
const getUserRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized", 404);
    }
    const userRatings = yield RatingSchema_1.default.find({ userId });
    res
        .status(200)
        .json({ success: true, message: "recived rating", userRatings });
});
exports.getUserRatings = getUserRatings;
//get all the rating
const getAllRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allratings = yield RatingSchema_1.default.find({ isDeleted: false, status: true }).populate("userId");
    if (!allratings) {
        throw new errorHandler_1.CustomError(" No review about findly", 404);
    }
    res.status(200).json({ success: true, message: "found it ", allratings });
});
exports.getAllRatings = getAllRatings;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const review = yield RatingSchema_1.default.findOne({ _id: id, userId });
    if (!review) {
        res.status(404).json({ success: false, message: "Review not found" });
        return;
    }
    review.isDeleted = true;
    yield review.save();
    res.json({ success: true, message: "Review deleted", review });
});
exports.deleteReview = deleteReview;
