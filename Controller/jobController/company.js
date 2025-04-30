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
exports.generateOfferLetter = exports.approveJobApplication = exports.rejectJobApplication = exports.findUserApplication = exports.findAppliedUsers = exports.getJobsByCompanies = exports.getAllJobPost = exports.getJobsById = exports.deleteJobPost = exports.updateJobDeadline = exports.updateJobPost = exports.createJobPost = void 0;
const JobSchema_1 = require("../../model/JobSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const JobApplicationSchema_1 = require("../../model/JobApplicationSchema");
const nodemailer_1 = __importDefault(require("nodemailer"));
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const CompanySchema_1 = require("../../model/CompanySchema");
const { VertexAI } = require('@google-cloud/vertexai');
const axios_1 = __importDefault(require("axios"));
const createJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { title, location, jobType, experienceLevel, industry, description, requirements, jobResponsibilities, salary, applicationDeadline, benefits, contactEmail, contactPhone, status } = req.body;
    console.log(req.body);
    // if (salary && typeof salary === 'object' && 'rate' in salary && 'min' in salary && 'max' in salary) {
    // } else {
    //     res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
    //     return;
    // }
    const job = new JobSchema_1.JobPost({
        title,
        company: companyId,
        location,
        jobType,
        experienceLevel,
        industry,
        description,
        requirements,
        jobResponsibilities,
        salary,
        applicationDeadline,
        benefits,
        contactEmail,
        contactPhone,
        status: status || "Open",
    });
    yield job.save();
    console.log(job);
    res.status(201).json({ message: "Job post created successfully", job });
});
exports.createJobPost = createJobPost;
const updateJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const jobId = req.params.jobId;
    const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
    const { title, location, jobType, experienceLevel, industry, description, requirements, jobResponsibilities, salary, applicationDeadline, benefits, contactEmail, contactPhone, status } = req.body;
    console.log("experienceLevel", experienceLevel);
    const job = yield JobSchema_1.JobPost.findOne({ _id: jobId, company: companyId });
    if (!job) {
        res.status(404).json({ message: "Job post not found or you do not have permission to edit it" });
        return;
    }
    const updatedFields = {};
    if (title)
        updatedFields.title = title;
    if (location)
        updatedFields.location = location;
    if (jobType)
        updatedFields.jobType = jobType;
    if (experienceLevel)
        updatedFields.experienceLevel = experienceLevel;
    if (industry)
        updatedFields.industry = industry;
    if (description)
        updatedFields.description = description;
    if (requirements)
        updatedFields.requirements = requirements;
    if (jobResponsibilities)
        updatedFields.jobResponsibilities = jobResponsibilities;
    if (salary && typeof salary === "object" && "rate" in salary && "min" in salary && "max" in salary) {
        updatedFields.salary = salary;
        console.log("ddd");
    }
    else if (salary) {
        res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
        return;
    }
    if (applicationDeadline)
        updatedFields.applicationDeadline = applicationDeadline;
    if (benefits)
        updatedFields.benefits = benefits;
    if (contactEmail)
        updatedFields.contactEmail = contactEmail;
    if (contactPhone)
        updatedFields.contactPhone = contactPhone;
    if (status)
        updatedFields.status = status;
    Object.assign(job, updatedFields);
    yield job.save();
    res.status(200).json({
        message: "Job post updated successfully",
        updatedFields
    });
});
exports.updateJobPost = updateJobPost;
const updateJobDeadline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const jobId = req.params.jobId;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { applicationDeadline } = req.body;
    if (!applicationDeadline) {
        res.status(400).json({ message: "Application deadline is required" });
        return;
    }
    const job = yield JobSchema_1.JobPost.findOne({ _id: jobId, company: companyId });
    if (!job) {
        res.status(404).json({ message: "Job post not found or unauthorized" });
        return;
    }
    job.applicationDeadline = applicationDeadline;
    yield job.save();
    res.status(200).json({
        message: "Job application deadline updated successfully",
        applicationDeadline
    });
});
exports.updateJobDeadline = updateJobDeadline;
const deleteJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const jobId = req.params.jobId;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const job = yield JobSchema_1.JobPost.findOne({ _id: jobId, company: companyId });
    if (!job) {
        res.status(404).json({ message: "Job post not found or you do not have permission to delete it" });
        return;
    }
    job.isDeleted = true;
    yield job.save();
    res.status(200).json({ message: "Job post soft deleted successfully" });
});
exports.deleteJobPost = deleteJobPost;
/// get jobs by id //
const getJobsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    if (!jobId) {
        throw new errorHandler_1.CustomError("job Id is required", 400);
    }
    const findJob = yield JobSchema_1.JobPost.findOne({ _id: jobId, isDeleted: false }).populate("company");
    if (!findJob) {
        throw new errorHandler_1.CustomError("job not found", 404);
    }
    res.status(200).json({ status: true, message: "get jobs by id", findJob });
});
exports.getJobsById = getJobsById;
const getAllJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1); // Ensures page is at least 1
    const limit = 10;
    const skip = (page - 1) * limit;
    let filters = { isDeleted: false };
    const parseQueryParam = (param) => {
        if (!param)
            return [];
        return Array.isArray(param) ? param.map(String) : String(param).split(",");
    };
    const filterKeys = ["title", "experienceLevel", "industry", "jobType"];
    filterKeys.forEach((key) => {
        const values = parseQueryParam(req.query[key]).filter(Boolean); // Removes empty strings
        if (values.length > 0) {
            filters[key] = { $in: values };
        }
    });
    const jobs = yield JobSchema_1.JobPost.find(filters)
        .populate("company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const totalJobs = yield JobSchema_1.JobPost.countDocuments(filters);
    res.status(200).json({
        success: true,
        message: "All jobs fetched successfully",
        jobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        hasMore: page * limit < totalJobs,
    });
});
exports.getAllJobPost = getAllJobPost;
// jobs by id //
// export const getJobsByCompanies = async (req: Request, res: Response) => {
//     const type = req.user && req.user.type
//     if (type !== "Company") {
//         res.status(403).json({ success: false, message: "Unauthorized" })
//         return
//     }
//     let companyId = type === "Company" ? req.user?.id : null
//     const postedJobs = await JobPost.find({ company: companyId }).populate("company")
//     res.status(200).json({ success: true, message: "found it", postedJobs })
// }
const getJobsByCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const type = req.user && req.user.type;
    if (type !== "Company") {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);
    let skip = (page - 1) * limit;
    const postedJobs = yield JobSchema_1.JobPost.find({ company: companyId, isDeleted: false })
        .populate("company")
        .skip(skip)
        .limit(limit);
    const totalJobs = yield JobSchema_1.JobPost.countDocuments({ company: companyId });
    console.log("totalJobs", totalJobs);
    res.status(200).json({
        success: true,
        message: "Jobs fetched successfully",
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
        totalJobs,
        jobsPerPage: postedJobs.length,
        postedJobs,
    });
});
exports.getJobsByCompanies = getJobsByCompanies;
const findAppliedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const appliedUsers = yield JobApplicationSchema_1.JobApplication.find({ companyId, isCompanyDelete: false }).populate("userId").populate("jobId");
    res.status(200).json({ success: true, message: "found all applications", appliedUsers });
});
exports.findAppliedUsers = findAppliedUsers;
const findUserApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, jobId } = req.params;
    if (!userId || !jobId) {
        throw new errorHandler_1.CustomError("User ID and Job ID are required", 400);
    }
    const application = yield JobApplicationSchema_1.JobApplication.findOne({ userId, jobId }).populate("userId").populate("jobId");
    if (!application) {
        throw new errorHandler_1.CustomError("No application found for this user and job", 404);
    }
    res.status(200).json({
        success: true,
        message: "Application found",
        application
    });
});
exports.findUserApplication = findUserApplication;
// Function to reject a job application
const rejectJobApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, jobId } = req.params;
    if (!userId || !jobId) {
        throw new errorHandler_1.CustomError("User ID and Job ID are required", 400);
    }
    // Find the application and populate userId and jobId fields
    const application = yield JobApplicationSchema_1.JobApplication.findOne({ userId, jobId })
        .populate("userId", "email firstName")
        .populate("jobId", "title");
    if (!application) {
        throw new errorHandler_1.CustomError("No application found for this user and job", 404);
    }
    // Ensure userId and jobId are populated objects
    if (!("email" in application.userId) || !("firstName" in application.userId)) {
        throw new errorHandler_1.CustomError("User data is not populated correctly", 500);
    }
    if (!("title" in application.jobId)) {
        throw new errorHandler_1.CustomError("Job data is not populated correctly", 500);
    }
    // Update status
    application.status = "Rejected";
    yield application.save();
    // Send email notification
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: application.userId.email,
        subject: "Job Application Update",
        text: `Dear ${application.userId.firstName},\n\nWe regret to inform you that your application for the position of ${application.jobId.title} has been rejected.\n\nThank you for your interest.\n\nBest regards,\nCompany Team`,
    };
    yield transporter.sendMail(mailOptions);
    res.status(200).json({
        success: true,
        message: "Application rejected and email sent to the user",
    });
});
exports.rejectJobApplication = rejectJobApplication;
const approveJobApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, jobId } = req.params;
    const { offerLetter } = req.body;
    if (!userId || !jobId || !offerLetter) {
        res.status(400).json({ success: false, message: "User ID, Job ID, and offer letter are required" });
        return;
    }
    const application = yield JobApplicationSchema_1.JobApplication.findOne({ userId, jobId })
        .populate("userId", "email firstName")
        .populate("jobId", "title");
    if (!application) {
        res.status(404).json({ success: false, message: "No application found for this user and job" });
        return;
    }
    if (!("email" in application.userId) || !("firstName" in application.userId)) {
        res.status(500).json({ success: false, message: "User data is not populated correctly" });
        return;
    }
    if (!("title" in application.jobId)) {
        res.status(500).json({ success: false, message: "Job data is not populated correctly" });
        return;
    }
    application.status = "Accepted";
    application.offerLetter = offerLetter;
    yield application.save();
    // Email configuration
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: application.userId.email,
        subject: "Job Offer Letter",
        text: `Dear ${application.userId.firstName},\n\nCongratulations! Your application for the position of ${application.jobId.title} has been approved. Please find your offer letter attached.\n\nBest regards,\nCompany Team`,
        attachments: [
            {
                filename: "Offer_Letter.pdf",
                content: offerLetter, // Assuming the offer letter is in text format, convert if needed
            },
        ],
    };
    yield transporter.sendMail(mailOptions);
    res.status(200).json({
        success: true,
        message: "Application approved and offer letter sent via email",
    });
});
exports.approveJobApplication = approveJobApplication;
const generateOfferLetter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { jobApplicationId, startDate } = req.body;
        console.log(req.body);
        if (!jobApplicationId || !startDate) {
            res.status(400).json({ error: "Job application ID and start date are required" });
            return;
        }
        const jobApplication = yield JobApplicationSchema_1.JobApplication.findById(jobApplicationId);
        if (!jobApplication) {
            res.status(404).json({ error: "Job application not found" });
            return;
        }
        const [jobPost, company, user] = yield Promise.all([
            JobSchema_1.JobPost.findById(jobApplication.jobId),
            CompanySchema_1.Company.findById(jobApplication.companyId),
            UserSchema_1.default.findById(jobApplication.userId),
        ]);
        if (!jobPost || !company || !user) {
            res.status(404).json({ error: "Related data not found" });
            return;
        }
        // Construct the prompt
        const prompt = `Generate a formal offer letter for ${user.firstName} ${user.lastName} for the position of ${jobPost.title} at ${company.name}.

    Company: ${company.name}, Address: ${((_a = company.address) === null || _a === void 0 ? void 0 : _a.city) || ""}, ${((_b = company.address) === null || _b === void 0 ? void 0 : _b.state) || ""}
    Job Title: ${jobPost.title}, Job Type: ${jobPost.jobType}, Start Date: ${startDate}
    Salary: ${jobPost.salary.min} - ${jobPost.salary.max} ${jobPost.salary.rate}
    contact number:${company.contact}
    Candidate: ${user.firstName} ${user.lastName}, Email: ${user.email}
    interview date ${startDate}
    Use a formal and professional tone. Include standard offer letter clauses.

    `;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new errorHandler_1.CustomError("GEMINI_API_KEY is not configured", 400);
        }
        const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { "Content-Type": "application/json" } });
        const candidates = (_c = response.data) === null || _c === void 0 ? void 0 : _c.candidates;
        if (!candidates || candidates.length === 0) {
            throw new errorHandler_1.CustomError("No candidates found in Gemini API response", 500);
        }
        const offerLetter = (_g = (_f = (_e = (_d = candidates[0]) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.parts) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.text;
        if (!offerLetter) {
            res.status(500).json({ error: "Failed to generate offer letter" });
            return;
        }
        // Save offer letter to job application
        jobApplication.offerLetter = offerLetter;
        yield jobApplication.save();
        res.json({ offerLetter });
    }
    catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Error generating offer letter" });
    }
});
exports.generateOfferLetter = generateOfferLetter;
