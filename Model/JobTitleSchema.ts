import mongoose, { Schema } from "mongoose";
import { ITitles } from "../types/allTypes";

const JobTitleSchema = new Schema<ITitles>({
    name: { type: String, required: true, unique: true },
    status:{type:Boolean,default:true},
    isDeleted:{type:Boolean,default:false}
},
{ timestamps: true }
    
);

export const Title = mongoose.model("Title", JobTitleSchema);
