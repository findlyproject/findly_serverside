import mongoose, { Schema } from "mongoose";
import { ICompany } from "../types/allTypes";

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    location: { type: String, required: true },
    about: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: Number, required: true },
    employees: {
      type: String,
      required: true,
      enum: ["internship", "remote", "hybrid"],
    },
    role: {
      type: String,
      enum: ["company", "premium"],
      default: "company",
    },

    subscriptionEndDate: { type: Date, default: null },
    subscriptionStartDate: { type: Date, default: null },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", CompanySchema);
