import mongoose, { Schema } from "mongoose";
import { ISavePost } from "../types/allTypes";

const SaveSchema=new Schema<ISavePost>({
    postId:{type:Schema.Types.ObjectId,ref:"Post"},
    userId:{type:Schema.Types.ObjectId,ref:"User"},
    timestamp:{type:Date,default:Date.now}

})


export const Save = mongoose.model("Save", SaveSchema);