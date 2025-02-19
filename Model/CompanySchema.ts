import mongoose, { Schema } from "mongoose";
import { ICompany } from "../types/allTypes";

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    about: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    contact: { type: Number, required: true },

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
    type:{type:String,required:true},
    age: { type: Number, required: false },
    IndustryType: { type: String, required: false },

    address: {
      pincode: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },

    subscriptionEndDate: { type: Date, default: null },
    subscriptionStartDate: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", CompanySchema);
