import { ICommunity, ICommunityMessage } from "./../types/allTypes";
import mongoose, { Schema } from "mongoose";

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
    profile:{
        type:String,
        

    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityMessageSchema=new Schema<ICommunityMessage>({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ['text', 'image', 'video', 'file'], // Example message types
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
})

export const CommunityMessage=mongoose.model<ICommunityMessage>("CommunityMessage",CommunityMessageSchema)
export const Community = mongoose.model<ICommunity>("Community", CommunitySchema);