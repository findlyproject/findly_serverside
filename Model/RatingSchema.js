"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ratingSchema = new mongoose_1.default.Schema({
    review: {
        type: String,
        required: true,
        trim: true,
    },
    starsRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Company",
    },
    targetCompanyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Company"
    },
    name: { type: String },
    email: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: false }
}, { timestamps: true });
const Rating = mongoose_1.default.model("Rating", ratingSchema);
exports.default = Rating;
