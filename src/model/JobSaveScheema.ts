import mongoose, { Schema } from "mongoose";

const JobSaveSchema = new Schema({
    userId: {type:Schema.Types.ObjectId,ref:"User",required:true},
    jobId: {type:Schema.Types.ObjectId,ref:"JobPost",required:true},
    timestamp: {
        type: Date,
        default: Date.now,
      },
})

export const JobSave = mongoose.model("JobSave",JobSaveSchema);




