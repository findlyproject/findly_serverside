import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        resume: { type: String, required: true },
        coverLetter: { type: String },
        introVideo: { type: String, required: false },
        status: { type: String, enum: ["Pending", "Reviewed", "Accepted", "Rejected"], default: "Pending" },
    },
    { timestamps: true }
);

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
