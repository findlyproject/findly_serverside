import mongoose,{Schema} from "mongoose";
import { IMessage } from "../types/allTypes";
const MessageSchema: Schema = new Schema <IMessage>({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true},
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true},
    type:{type:String},
    seen:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  });


  export const Message = mongoose.model<IMessage>("Message", MessageSchema);
  