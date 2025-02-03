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
  role?:"user"|"premium",
  subscriptionEndDate: Date | null,
  subscriptionStartDate: Date | null,
  _id:string;
}


const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String,  },
    lastName: { type: String,  },
    email: { type: String, unique: true },
    password: { type: String,  },
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
      startYear: { type:String ,  },
      endYear: { type: String,  },
      collage: { type: String,  },
    },

    projects: [
      {
        title: { type: String,  },
        description: { type: String,  },
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
   

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    about: { type: String },

    resume: [
      {
        fileUrl: { type: String,  },
        type: { type: String, enum: ["PDF", "Video"],  },
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
