import { IJobPost } from "../types/allTypes";
import { Schema, model } from "mongoose";

const JobPostSchema = new Schema<IJobPost>(
  {
    title: { type: String, required: true, maxlength: 100 },
<<<<<<< HEAD
    company: { type: Schema.Types.ObjectId, ref: "Company"},
=======
    company:{ type: Schema.Types.ObjectId, ref: "Company", required: true },
>>>>>>> 6e13e2f3e9994f302fed610b4d0570b20d9a024d
    location: { type: String, required: true },
    jobType: { 
      type: String, 
      enum: ["Full-time", "Part-time", "Contract", "Internship"], 
      required: true 
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Expert"],
      required: true
    },
    qualification:{type:String},
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
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }], 
    reports: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const JobPost = model<IJobPost>("JobPost", JobPostSchema);
