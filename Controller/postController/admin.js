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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPosts = exports.deletePost = exports.dismissReports = exports.getReports = void 0;
const ReportSchema_1 = require("../../model/ReportSchema");
const PostSchema_1 = require("../../model/PostSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
// get all reports
const getReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reports = yield ReportSchema_1.Report.find().populate("reportedBy");
    res
        .status(200)
        .json({ status: "success", massage: "Got all the reports", reports });
});
exports.getReports = getReports;
// dismiss reports of a post
const dismissReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reportId = req.params.id;
    const report = yield ReportSchema_1.Report.findById(reportId);
    if (!report) {
        throw new errorHandler_1.CustomError("report not found", 404);
    }
    report.isDeleted = true;
    yield report.save();
    res
        .status(200)
        .json({ status: "success", message: "Reports dismissed successfully", report });
});
exports.dismissReports = dismissReports;
//delete a post
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const updatedPost = yield PostSchema_1.Post.findByIdAndUpdate(postId, { $set: { isDeleted: true } }, { new: true });
    if (!updatedPost) {
        res.status(404).json({ message: "Post not found" });
        return;
    }
    res
        .status(200)
        .json({
        status: "success",
        message: "Post marked as deleted",
        updatedPost,
    });
});
exports.deletePost = deletePost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield PostSchema_1.Post.find({ isDeleted: false })
        .populate("owner")
        .populate("reports")
        .populate("likedBy", "firstName lastName profileImage")
        .populate({
        path: "comments",
        match: { isDeleted: false },
        populate: {
            path: "user",
            select: "firstName lastName profileImage ",
        },
    });
    const totalPosts = yield PostSchema_1.Post.countDocuments();
    res.status(200).json({
        status: true,
        message: "Got all the posts and count",
        posts,
        totalPosts,
    });
});
exports.getAllPosts = getAllPosts;
