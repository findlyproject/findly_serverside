import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    phoneNumber: { type: String, }, 
    dateOfBirth: { type: Date,  },
    location: { type: String, },
    profileImage: { type: String,  },
    banner: { type: String,  },
    skills: [{ type: String, }],
    jobTitle:[{ type: String,  }] ,
    jobLocation:[ { type: String,  }],
    
    education: {
      qualification: { type: String },
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

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 

    about: { type: String, },

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
  },
  { timestamps: true } // Automatically adds `createdAt` & `updatedAt`
);

const User = mongoose.model("User", UserSchema);
export default User;
