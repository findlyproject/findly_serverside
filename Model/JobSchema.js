"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPost = void 0;
const mongoose_1 = require("mongoose");
const JobPostSchema = new mongoose_1.Schema({
    title: { type: String, required: true, maxlength: 100 },
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: String, required: true },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Temporary", "Contract", "Internship"],
        required: true
    },
    experienceLevel: {
        type: String,
        enum: ["Entry", "Mid", "Senior", "Expert"],
        required: true
    },
    qualification: { type: String },
    industry: { type: String, required: true },
    description: { type: String, required: true, maxlength: 1000 },
    requirements: [{ type: String, required: true }],
    jobResponsibilities: [{ type: String, required: true }],
    salary: {
        rate: { type: String, required: true },
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    applicationDeadline: { type: Date },
    benefits: [{ type: String }],
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    reports: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.JobPost = (0, mongoose_1.model)("JobPost", JobPostSchema);
