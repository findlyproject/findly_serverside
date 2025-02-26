import mongoose, { Schema } from "mongoose";
import { ICommunity, ICommunityMessage, IConversation, IMessage } from "../types/allTypes";


const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }], 
  lastUpdated: { type: Date, default: Date.now }
});



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


const MessageSchema: Schema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true},
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true},
  type:{type:String},
  seen:{type:Boolean,default:false},
  isDeleted:{type:Boolean,default:false},
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const Conversation = mongoose.model("Conversation", ConversationSchema);
export const Message = mongoose.model("Message",MessageSchema);
export const CommunityMessage=mongoose.model("CommunityMessage",CommunityMessageSchema)
export const Community = mongoose.model("Community", CommunitySchema);