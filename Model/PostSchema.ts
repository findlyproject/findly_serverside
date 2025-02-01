import mongoose, { Document, Schema, Types } from "mongoose";


import { IPost } from "../types/allTypes";

const PostSchema = new Schema <IPost>(
  {
    description: { type: String, maxlength: 500 },
    images: [{ type: String }],
    video: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }], 
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);

