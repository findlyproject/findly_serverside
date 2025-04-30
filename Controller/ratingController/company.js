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
exports.deleteReviews = exports.deleteReview = exports.findreviewsByTargetedId = exports.findreviewsBycompany = void 0;
const RatingSchema_1 = __importDefault(require("../../model/RatingSchema"));
// export const findreviewsBycompany=async(req:Request,res:Response)=>{
//     const companyId=req.user?.id
//     const reviews=await Rating.find({targetCompanyId:companyId,isDeleted:false}).populate("companyId userId")
//     res.status(200).json({success:true,message:"reviews found it ",reviews})
//   }
const findreviewsBycompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page = 1, limit = 5 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const totalCount = yield RatingSchema_1.default.countDocuments({ targetCompanyId: companyId, isDeleted: false });
    const reviews = yield RatingSchema_1.default.find({ targetCompanyId: companyId, isDeleted: false })
        .populate("companyId userId")
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    res.status(200).json({ success: true, message: "Reviews found", reviews, totalCount, hasMore: pageNumber * limitNumber < totalCount });
});
exports.findreviewsBycompany = findreviewsBycompany;
const findreviewsByTargetedId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { targetedId } = req.params;
    const reviews = yield RatingSchema_1.default.find({ targetCompanyId: targetedId, isDeleted: false }).populate("companyId userId");
    res.status(200).json({ success: true, message: "found it ", reviews });
});
exports.findreviewsByTargetedId = findreviewsByTargetedId;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = req.params.id;
    const review = yield RatingSchema_1.default.findById(reviewId);
    if (!review) {
        res.status(404).json({ success: false, message: "Review not found" });
        return;
    }
    review.isDeleted = true;
    yield review.save();
    res.status(200).json({ success: true, message: "Review soft deleted successfully" });
});
exports.deleteReview = deleteReview;
const deleteReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    let companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const review = yield RatingSchema_1.default.findOne({ _id: id, companyId });
    if (!review) {
        res.status(404).json({ success: false, message: "Review not found" });
        return;
    }
    review.isDeleted = true;
    yield review.save();
    res.json({ success: true, message: "Review deleted", review });
});
exports.deleteReviews = deleteReviews;
