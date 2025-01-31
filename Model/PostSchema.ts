import mongoose, { Document, Schema, Types } from "mongoose";

interface IPost extends Document {
  description?: string;
  owner: Types.ObjectId;
  images?: string;
  lists: Types.ObjectId[];
  likedBy: Types.ObjectId[];
  reports: {
    reportedBy: Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }[];
  comments: {
    user: Types.ObjectId;
    comment: string;
    commentedAt: Date; 
    replies: {
      user: Types.ObjectId;
      reply: string;
      repliedAt: Date;
    }[];
  }[];
}

const PostSchema = new Schema<IPost>(
  {
    description: { type: String, maxlength: 500 },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    reports: [
      {
        reportedBy: {
          type: Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
        reason: { type: String, required: true },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
        comment: { type: String, required: true },
        commentedAt: { type: Date, default: Date.now }, 
        replies: [
          {
            user: {
              type: Schema.Types.ObjectId,
              ref: "Users",
              required: true,
            },
            reply: { type: String, required: true },
            repliedAt: { type: Date, default: Date.now }, 
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
