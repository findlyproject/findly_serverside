import mongoose, {connection, Schema } from "mongoose";
import { IUser } from "../types/allTypes";
const profile = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735360/profile_jtwxaj.png"
const banner = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735269/banner_ozuamb.png"
const companyLogo="https://img.freepik.com/free-vector/diamond-square-puzzle_78370-8329.jpg?t=st=1738926443~exp=1738930043~hmac=07611684498f289e765ee3efbe528e97e27d9d41e4b518014740c7b3fb07acae&w=740"

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },  
    password: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    location: { type: String },
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],

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
    experience:[{
      jobRole:{type:String},
      companyName:{type:String},
      startYear:{type:String},
      endYear:{type:String}

    }],

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

    connecting:[{
      connectionID:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: Boolean, default: false },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }],

    about: { type: String },

    resumePDF: [
      {
        fileUrl: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false },
      }
    ],
    resumeVideo: [
      {
        fileUrl: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false },
      }
    ],
    isVerified:{  
      type:Boolean,
      default:false
    },
   
    coverLetter: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
