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
exports.GetAllReportsOfUsers = exports.GetAllReportsOfPosts = void 0;
const ReportSchema_1 = require("../../model/ReportSchema");
const GetAllReportsOfPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postReports = yield ReportSchema_1.Report.find({ isDeleted: false, postId: { $exists: true, $ne: null } })
        .populate('reportedBy postId');
    // if (!postReports || postReports.length === 0) {
    //   throw new CustomError('No reports found for posts.', 404);
    // }
    res.status(200).json({
        status: true,
        message: 'All reports of posts fetched successfully.',
        postReports,
    });
});
exports.GetAllReportsOfPosts = GetAllReportsOfPosts;
const GetAllReportsOfUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReports = yield ReportSchema_1.Report.find({ isDeleted: false, userId: { $exists: true, $ne: null } })
        .populate('reportedBy userId');
    // if (!userReports || userReports.length === 0) {
    //   throw new CustomError('No reports found for users.', 404);
    // }
    res.status(200).json({
        status: true,
        message: 'All reports of users fetched successfully.',
        userReports,
    });
});
exports.GetAllReportsOfUsers = GetAllReportsOfUsers;
