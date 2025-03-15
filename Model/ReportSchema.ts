import mongoose, { Schema } from "mongoose";
import { IReport } from "../types/allTypes";

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    postId:{type: Schema.Types.ObjectId, ref: "Post"},
    userId:{type: Schema.Types.ObjectId, ref: "User" },
    reportedAt: { type: Date, default: Date.now },
    isDeleted:{type:Boolean,default:false},
  },
  
  { timestamps: true }
);

export const Report = mongoose.model("Report", ReportSchema);
