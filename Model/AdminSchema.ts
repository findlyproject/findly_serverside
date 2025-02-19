

import mongoose, { Schema }  from "mongoose";
import { IAdmin } from "../types/allTypes";


const AdminSchema=new Schema<IAdmin>(
    {
        email:{type:String,required:true},
        password:{type:String,required:true},
        firstName:{type:String},
        lastName:{type:String},
        profileImage:{type:String},
        bio:{type:String},
        role: {type: String,enum: ["user", "admin"],default: "admin",},
        phoneNumber:{type:String},
        isBlocked: { type: Boolean, default: false },
        isDeleted:{type:Boolean,default:false},  

    }
)

export const Admin  = mongoose.model("Admin",AdminSchema );