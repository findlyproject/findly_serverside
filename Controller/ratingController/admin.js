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
exports.getRatings = exports.approveRating = exports.deleteRating = void 0;
const errorHandler_1 = require("../../Utils/errorHandler");
const RatingSchema_1 = __importDefault(require("../../model/RatingSchema"));
//delete rating
const deleteRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ratingId = req.params.id;
    if (!ratingId) {
        throw new errorHandler_1.CustomError("Rating ID is required.", 400);
    }
    const deletedRating = yield RatingSchema_1.default.findById({ _id: ratingId });
    if (!deletedRating) {
        throw new errorHandler_1.CustomError("Rating not found.", 404);
    }
    deletedRating.isDeleted = true;
    yield deletedRating.save();
    res.status(200).json({ status: true, message: "Rating deleted successfully.", deletedRating });
});
exports.deleteRating = deleteRating;
//accept rating
const approveRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ratingid = req.params.id;
    if (!ratingid) {
        throw new errorHandler_1.CustomError("Rating ID is required.", 400);
    }
    const rating = yield RatingSchema_1.default.findById({ _id: ratingid });
    if (!rating) {
        throw new errorHandler_1.CustomError("Rating not found.", 404);
    }
    rating.status = true;
    yield rating.save();
    res.status(200).json({ status: true, message: "Rating approved successfully.", rating });
});
exports.approveRating = approveRating;
//get allratings in adminside
const getRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ratings = yield RatingSchema_1.default.find({ isDeleted: false, companyId: null }).populate("userId");
    if (!ratings) {
        throw new errorHandler_1.CustomError("ratings not found", 404);
    }
    res.status(200).json({ status: true, message: 'ratings', ratings });
});
exports.getRatings = getRatings;
