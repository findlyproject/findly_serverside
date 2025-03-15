import mongoose, { Schema, Model } from "mongoose";
import { IJobApplication } from "../types/allTypes";

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        resumeName: { type: String, required: true },
        resumeurl: { type: String, required: true },
        coverLetter: { type: String },
        introVideoName: { type: String },
        introVideoUrl: { type: String },
        status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
        offerLetter:{ type: String },
        isUserDelete:{type:Boolean,default:false},
        isCompanyDelete:{type:Boolean,default:false},
        isSaved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const JobApplication: Model<IJobApplication> = mongoose.model<IJobApplication>(
    "JobApplication",
    jobApplicationSchema
);
