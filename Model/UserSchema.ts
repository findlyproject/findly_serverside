import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  location?: string;
  profileImage?: string;
  banner?: string;
  skills?: string[];
  jobTitle?: string[];
  jobLocation?: string[];

  education: {
    qualification: string;
    startYear: string;
    endYear: string;
    location: string;
  };

  projects?: {
    title: string;
    description: string;
    link?: string;
  }[];

  followers?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];

  about?: string;

  resume?: {
    fileUrl: string;
    type: "PDF" | "Video";
    uploadedAt?: Date;
  }[];

  coverLetter?: string;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id:string;
}


const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    location: { type: String },
    profileImage: { type: String },
    banner: { type: String },
    skills: [{ type: String }],
    jobTitle: [{ type: String }],
    jobLocation: [{ type: String }],

    education: {
      qualification: { type: String, },
      startYear: { type:String , required: true },
      endYear: { type: String, required: true },
      collage: { type: String, required: true },
    },

    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String },
      },
    ],

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    about: { type: String },

    resume: [
      {
        fileUrl: { type: String, required: true },
        type: { type: String, enum: ["PDF", "Video"], required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    coverLetter: { type: String },

    isBlocked: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } 
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
