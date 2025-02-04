

import mongoose, { Schema }  from "mongoose";
import { IAdmin } from "../types/allTypes";


const AdminSchema=new Schema<IAdmin>(
    {
        email:{type:String,required:true},
        password:{type:String,required:true}

    }
)

export const Admin  = mongoose.model("Admin",AdminSchema );