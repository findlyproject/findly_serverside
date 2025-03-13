import mongoose, { Schema } from "mongoose";
import {
  ICommunity,
  ICommunityMessage,
  IConversation,
  IMessage,
} from "../types/allTypes";
import { boolean } from "zod";

//community
const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    profile: {
      type: String,
    },

    members: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,

          refPath: "memberModel",
        },
        memberModel: {
          type: String,
          enum: ["User", "Company"],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityMessageSchema = new Schema<ICommunityMessage>({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'User',
    // required: true,
    refPath: "senderModel",
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Company"], // Specify both models
  },
  message: {
    type: String,
    required: true,
  },
  isDelete: { type: Boolean, default: false },
  type: {
    type: String,
    required: true,
    enum: ["text", "image", "video", "file"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

//message
const MessageSchema: Schema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String },
  seen: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  lastUpdated: { type: Date, default: Date.now },
  isStarredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // users who starred this conversation
  isBlockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], 
});

export const Conversation = mongoose.model("Conversation", ConversationSchema);
export const Message = mongoose.model("Message", MessageSchema);
export const CommunityMessage = mongoose.model(
  "CommunityMessage",
  CommunityMessageSchema
);
export const Community = mongoose.model("Community", CommunitySchema);
