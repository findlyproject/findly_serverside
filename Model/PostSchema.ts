import mongoose, { Document, Schema, Types } from "mongoose"
import {  } from "module";
import { IPost } from "../types/allTypes";

const PostSchema = new Schema <IPost>(
  {
    description: { type: String, maxlength: 500 },
    images: [{ type: String }],
    video: { type: String }, 
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likedBy: [{ 
      type: Schema.Types.ObjectId, 
      required: true, 
      refPath: "userModel" 
    }],
    userModel: { 
      type: String, 
      // required: true, 
      enum: ["User", "Company"] 
    },
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }], 
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);

