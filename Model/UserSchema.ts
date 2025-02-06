import mongoose, {Schema } from "mongoose";
import { IUser } from "../types/allTypes";
import { boolean } from "zod";
const profile = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735360/profile_jtwxaj.png"
const banner = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735269/banner_ozuamb.png"


const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    location: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    profileImage: {
      type: String,
      default: profile,
    },
    banner: {
      type: String,
      default: banner,
    },
    skills: [{ type: String }],
    jobTitle: [{ type: String }],
    jobLocation: [{ type: String }],

    education: [
      {
        qualification: { type: String },
        startYear: { type: String },
        endYear: { type: String },
        college: { type: String },  
      }
    ], 

    projects: [
      {
        title: { type: String },
        description: { type: String },
        link: { type: String },
      },
    ],
    role: {
      type: String,
      enum: ["user", "premium"],
      default: "user",
    },

    subscriptionEndDate: { type: Date, default: null },
    subscriptionStartDate: { type: Date, default: null },

    connecting: [],

    about: { type: String },

    resumePDF: {
      fileUrl: { type: String },
      fileName: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
    resumeVideo: {
      fileUrl: { type: String },
      fileName: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
    isVerified:{
      type:Boolean,
      default:false
    },
   
    coverLetter: { type: String },
    isBlocked: { type: Boolean, default: false },
  }, 
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
