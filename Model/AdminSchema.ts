

import mongoose, { Schema }  from "mongoose";
import { IAdmin } from "../types/allTypes";


const AdminSchema=new Schema<IAdmin>(
    {
        email:{type:String,required:true},
        password:{type:String,required:true},
        role: {type: String,enum: ["user", "admin"],default: "admin",},
        isBlocked: { type: Boolean, default: false },
        isDeleted:{type:Boolean,default:false},  

    }
)

export const Admin  = mongoose.model("Admin",AdminSchema );