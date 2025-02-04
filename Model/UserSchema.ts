import mongoose, {Schema } from "mongoose";
import { IUser } from "../types/allTypes";


const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    location: { type: String },
    profileImage: { type: String },
    banner: { type: String },
    skills: [{ type: String }],
    jobTitle: [{ type: String }],
    jobLocation: [{ type: String }],

    education: {
      qualification: { type: String },
      startYear: { type: String },
      endYear: { type: String },
      collage: { type: String },
    },

    projects: [
      {
        title: { type: String },
        description: { type: String },
        link: { type: String },
      },
    ],
    role: {
      type: String,
      enum: ["user","premium"],
      default: "user",
    },


    subscriptionEndDate:{ type: Date, default: null},
    subscriptionStartDate:{ type: Date, default: null },
   
    connecting: [],

    about: { type: String },

    resume: [
      {
        fileUrl: { type: String },
        type: { type: String, enum: ["PDF", "Video"] },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    coverLetter: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
