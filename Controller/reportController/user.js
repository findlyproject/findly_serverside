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
exports.reportuser = exports.ReportPost = void 0;
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const ReportSchema_1 = require("../../model/ReportSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const PostSchema_1 = require("../../model/PostSchema");
//report a post
const ReportPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized: User ID missing", 401);
    }
    const { reason, postId } = req.body;
    if (!reason || reason.trim() === "") {
        throw new errorHandler_1.CustomError("Comment cannot be empty", 400);
    }
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    const report = new ReportSchema_1.Report({
        reportedBy: userId,
        reason,
        postId: postId
    });
    yield report.save();
    if (!post.reports) {
        post.reports = [];
    }
    post.reports.push(report.id);
    yield post.save();
    res
        .status(200)
        .json({ status: true, message: "reported successfully", report });
});
exports.ReportPost = ReportPost;
//report a user
const reportuser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { reason, repoteduserid } = req.body;
    if (!userid) {
        throw new errorHandler_1.CustomError("User ID is missing", 400);
    }
    const finduser = yield UserSchema_1.default.findOne({ _id: repoteduserid });
    if (!finduser) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    if (!repoteduserid) {
        throw new errorHandler_1.CustomError("Reported user ID is missing", 400);
    }
    const findreporteduser = yield UserSchema_1.default.findOne({ _id: repoteduserid }).populate("reports");
    if (!findreporteduser) {
        throw new errorHandler_1.CustomError("Reported user not found", 404);
    }
    const report = new ReportSchema_1.Report({
        reportedBy: userid,
        userId: repoteduserid,
        reason,
    });
    yield report.save();
    if (!Array.isArray(findreporteduser.reports)) {
        findreporteduser.reports = [];
    }
    findreporteduser.reports.push(report.id);
    const a = yield findreporteduser.save();
    const popuatedreports = yield UserSchema_1.default.findOne({ _id: repoteduserid }).populate("reports");
    res
        .status(200)
        .json({ status: true, message: "Reported successfully", popuatedreports });
});
exports.reportuser = reportuser;
