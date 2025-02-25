import mongoose, { Schema } from "mongoose";
import { IConversation } from "../types/allTypes";

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }], // Reference messages
  lastUpdated: { type: Date, default: Date.now }
});

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
