import { Company } from "../../model/CompanySchema";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Request, Response } from "express";


export const findComapanies=async(req:Request,res:Response)=>{
       const companies=await Company.find()
       res.status(200).json({success:true,message:"founded",companies})
}