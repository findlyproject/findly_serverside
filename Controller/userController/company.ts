import { Company } from "../../model/CompanySchema";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Request, Response } from "express";


export const findComapanies=async(req:Request,res:Response)=>{
       const companies=await Company.find()
       res.status(200).json({success:true,message:"founded",companies})
}


export const spacificCompanyDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyId = req.params.companyId;

  if(!companyId){
    res.status(404).json({status:false,message:"cannot find id"})
    return
  }
  const findCompanyprofile = await Company.findOne({_id:companyId,isDeleted:false,isBlocked:false})

  
  if(!findCompanyprofile){
    res.status(404).json({status:false,message:"cannot find  profile"})
    return
  }

  res
    .status(200)
    .json({ status: true, message: " profile finded", findCompanyprofile });
};