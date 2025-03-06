import mongoose, { Document, Schema, Types } from "mongoose";
import { IComment } from "../types/allTypes";
import { IReply } from "../types/allTypes";

const ReplySchema = new Schema<IReply>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reply: { type: String, required: true },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
     
    user: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      refPath: "ownerModel" // 🔹 Dynamic reference field
    },
    userModel: { 
      type: String, 
      required: true, 
      enum: ["User", "Company"] // 🔹 Specify allowed models
    },
    comment: { type: String, required: true },
    replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const Reply = mongoose.model("Reply", ReplySchema);
export const Comment = mongoose.model("Comment", CommentSchema);
