
import {IJobPost} from "../types/allTypes"

import { Schema, model } from "mongoose";
   const JobPostSchema = new Schema<IJobPost>(
    {
      title: { type: String, required: true, maxlength: 100 },
      company: { type: String, required: true },
      location: { type: String, required: true },
      jobType: { 
        type: String, 
        enum: ["Full-time", "Part-time", "Contract", "Internship"], 
        required: true 
      },
      description: { type: String, required: true, maxlength: 1000 },
      requirements: [{ type: String, required: true }],
      salary: { type: String, required: true },
      postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      images: {
        type: [String], 
        validate: [(val: string[]) => val.length <= 5, "Cannot upload more than 5 images"]
      },
      
      likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }], 
      reports: [{ type: Schema.Types.ObjectId, ref: "User" }], 
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  
  export const JobPost = model<IJobPost>("JobPost", JobPostSchema);