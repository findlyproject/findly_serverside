import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        resumeName: { type: String, required: true },
        resumeurl: { type: String, required: true },
        coverLetter: { type: String },
        introVideoName: { type: String, required: false },
        introVideoUrl: { type: String, required: false },
        status: { type: String, enum: ["Pending", "Reviewed", "Accepted", "Rejected"], default: "Pending" },
    },
    { timestamps: true }
);

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
