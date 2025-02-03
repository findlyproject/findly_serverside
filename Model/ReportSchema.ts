
import mongoose, { Document, Schema, Types } from "mongoose";
import { IReport } from "../types/allTypes";

const ReportSchema = new Schema<IReport> (
    {
      reportedBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
      reason: { type: String, required: true },
      reportedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  
  export const Report = mongoose.model("Report", ReportSchema);
  