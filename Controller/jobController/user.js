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
exports.getRecommendedJobs = exports.similarjobs = exports.getsavedjobs = exports.saveJobs = exports.applydeJobs = exports.applyToJob = void 0;
const JobSchema_1 = require("../../model/JobSchema");
const JobApplicationSchema_1 = require("../../model/JobApplicationSchema");
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
const JobSaveScheema_1 = require("../../model/JobSaveScheema");
const applyToJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { jobId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { coverLetter, resumeName, resumeUrl, resumeVideoName, resumeVideoUrl, } = req.body;
    if (!coverLetter) {
        res
            .status(404)
            .json({ status: false, message: "Cover letter is required" });
        return;
    }
    const findUser = yield UserSchema_1.default.findOne({ _id: userId });
    if (!findUser) {
        res.status(404).json({ status: false, message: "User not found" });
        return;
    }
    const resumdocument = (_b = findUser === null || findUser === void 0 ? void 0 : findUser.resumePDF) === null || _b === void 0 ? void 0 : _b.find((item) => item.isDeleted === false);
    const resumVideoFile = (_c = findUser === null || findUser === void 0 ? void 0 : findUser.resumeVideo) === null || _c === void 0 ? void 0 : _c.find((item) => item.isDeleted === false);
    const job = yield JobSchema_1.JobPost.findOne({ _id: jobId, isDeleted: false });
    if (!job) {
        res.status(404).json({ message: "Job post not found or has been deleted" });
        return;
    }
    const existingApplication = yield JobApplicationSchema_1.JobApplication.findOne({ jobId, userId });
    if (existingApplication) {
        res.status(400).json({ message: "You have already applied for this job" });
        return;
    }
    const application = new JobApplicationSchema_1.JobApplication({
        jobId,
        userId,
        coverLetter,
        status: "Pending",
        companyId: job.company,
        resumeName: resumeName ? resumeName : resumdocument === null || resumdocument === void 0 ? void 0 : resumdocument.fileName,
        resumeurl: resumeUrl ? resumeUrl : resumdocument === null || resumdocument === void 0 ? void 0 : resumdocument.fileUrl,
        introVideoName: resumeVideoName
            ? resumeVideoName
            : resumVideoFile === null || resumVideoFile === void 0 ? void 0 : resumVideoFile.fileName,
        introVideoUrl: resumeVideoUrl ? resumeVideoUrl : resumVideoFile === null || resumVideoFile === void 0 ? void 0 : resumVideoFile.fileUrl,
    });
    const saveapplication = yield application.save();
    res.status(201).json({
        message: "Application submitted successfully",
        application: saveapplication,
    });
});
exports.applyToJob = applyToJob;
// finde applyde jobs //
const applydeJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("user id is not found", 404);
    }
    const findeapllyedJObs = yield JobApplicationSchema_1.JobApplication.find({ userId })
        .populate({
        path: "jobId",
        populate: {
            path: "company",
        },
    })
        .populate("userId", "firstName email");
    if (findeapllyedJObs.length < 0) {
        res.status(404).json({ status: false, message: "applyed jobs not found" });
    }
    res
        .status(200)
        .json({ status: true, message: "applyed jobs", data: findeapllyedJObs });
});
exports.applydeJobs = applydeJobs;
/// save jobs //
const saveJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(404).json({ status: false, message: "user id is not found" });
        return;
    }
    const jobId = req.params.id;
    if (!jobId) {
        res.status(404).json({ status: false, message: "jobId is not found" });
    }
    const existingJob = yield JobSaveScheema_1.JobSave.findOne({ userId, jobId });
    if (existingJob) {
        yield JobSaveScheema_1.JobSave.findByIdAndDelete(existingJob._id);
        res.status(200).json({ status: true, message: "Job unsaved", existingJob });
        return;
    }
    const savejobes = new JobSaveScheema_1.JobSave({
        userId,
        jobId,
    });
    const savejobe = savejobes.save();
    res.status(200).json({ status: true, message: "job saved", data: savejobe });
});
exports.saveJobs = saveJobs;
// get saved jobs //
const getsavedjobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("User ID is not found", 404);
    }
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalSavedJobs = yield JobSaveScheema_1.JobSave.countDocuments({ userId });
    const savedJobs = yield JobSaveScheema_1.JobSave.find({ userId })
        .populate({
        path: "jobId",
        populate: {
            path: "company",
        },
    })
        .populate("userId")
        .skip(skip)
        .limit(limit);
    if (savedJobs.length === 0) {
        res.status(404).json({ status: false, message: "Saved jobs not found" });
        return;
    }
    res.status(200).json({
        status: true,
        message: "Saved jobs retrieved successfully",
        totalPages: Math.ceil(totalSavedJobs / limit),
        currentPage: page,
        totalJobs: totalSavedJobs,
        data: savedJobs,
    });
});
exports.getsavedjobs = getsavedjobs;
/// get simular jobs and same company jobs
const similarjobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobType, companyName } = req.params;
    console.log({ jobType, companyName });
    const page = Number(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;
    const totalJobs = yield JobSchema_1.JobPost.countDocuments({
        jobType,
    });
    console.log("totalJobs,totalJobs", totalJobs);
    const jobs = yield JobSchema_1.JobPost.find({
        jobType,
    })
        .populate("company")
        .skip(skip)
        .limit(limit);
    const allJobs = yield JobSchema_1.JobPost.find()
        .populate("company")
        .skip(skip)
        .limit(limit);
    const filteredJobs = allJobs.filter((job) => { var _a; return ((_a = job === null || job === void 0 ? void 0 : job.company) === null || _a === void 0 ? void 0 : _a.name) == companyName; });
    res.status(200).json({
        success: true,
        message: "Jobs filtered successfully",
        similarjobs: jobs,
        similarcompany: filteredJobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        hasMore: page * limit < totalJobs,
    });
});
exports.similarjobs = similarjobs;
const getRecommendedJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield UserSchema_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (!user.jobTitle ||
        !Array.isArray(user.jobTitle) ||
        user.jobTitle.length === 0) {
        res.status(400).json({ message: "User job title not found" });
        return;
    }
    const userJobTitles = user.jobTitle.map((title) => title.toLowerCase());
    const jobs = yield JobSchema_1.JobPost.find({
        title: { $in: userJobTitles.map((title) => new RegExp(`^${title}$`, "i")) },
    }).populate("company");
    res.status(200).json({ jobs });
});
exports.getRecommendedJobs = getRecommendedJobs;
