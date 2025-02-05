import mongoose, { Document, Schema, Types } from "mongoose"
import {  } from "module";
import { IPost } from "../types/allTypes";

const PostSchema = new Schema <IPost>(
  {
    description: { type: String, maxlength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }], 
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);

