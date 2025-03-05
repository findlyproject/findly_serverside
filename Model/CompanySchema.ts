import mongoose, { Schema } from "mongoose";
import { ICompany } from "../types/allTypes";
import { string } from "zod";
const banner = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735269/banner_ozuamb.png"

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    about: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String,required: true, },
    contact: { type: Number, required: true },
    banner: {
      type: String,
      default: banner,
    },
    founder:{type:String,require:true},
    foundedAt:{type:Date},
    headquarters:{type:String},
    employees: [
      {
        employee: { type: Schema.Types.ObjectId, ref: "User", }, 
        position: { type: String, required: true }, 
      },
    ],
    role: {
      type: String,
      enum: ["company", "premium"],
      default: "company",
    },
    type:{type:String},
    IndustryType: { type: String, required: false },

    address: {
      pincode: { type: String,},
      landmark: { type: String },
      city: { type: String,},
      state: { type: String, },
      country: { type: String, required: true },
    },
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    subscriptionEndDate: { type: Date, default: null },
    subscriptionStartDate: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    services:[
      {type:String,require}
    ],
    workHours: {
      start: { type: String, default: "09:00" }, 
      end: { type: String, default: "5:00" }  
  }
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", CompanySchema);
  