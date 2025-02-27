import mongoose, { Schema } from "mongoose";
import { ICompany } from "../types/allTypes";
import { string } from "zod";
const banner = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1738735269/banner_ozuamb.png"

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: false },
    about: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String,required: true, },
    contact: { type: Number, required: true },
    banner: {
      type: String,
      default: banner,
    },
    founder:{type:String,require:true},
    foundedAt:{type:String},
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
    age: { type: Number, required: false },
    IndustryType: { type: String, required: false },

    address: {
      pincode: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
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
    startingDate:{ type: Date, default: null },
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
  