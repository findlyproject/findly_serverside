import mongoose, { Schema } from "mongoose";
import { ISkill } from "../types/allTypes";

const SkillSchema = new Schema<ISkill>({
    name: { type: String, required: true, unique: true },
    status:{type:Boolean,default:true},
    isDeleted:{type:Boolean,default:false}
},
{ timestamps: true }
    
);

export const Skill = mongoose.model("Skill", SkillSchema);
