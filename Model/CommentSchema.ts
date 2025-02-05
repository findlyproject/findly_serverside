import mongoose, { Document, Schema, Types } from "mongoose";

import { IComment } from "../types/allTypes";
import { IReply } from "../types/allTypes";

const ReplySchema = new Schema<IReply>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    reply: { type: String, required: true },
    repliedAt: { type: Date, default: Date.now },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    comment: { type: String, required: true },
    commentedAt: { type: Date, default: Date.now },
    replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const Reply = mongoose.model("Reply", ReplySchema);
export const Comment = mongoose.model("Comment", CommentSchema);
