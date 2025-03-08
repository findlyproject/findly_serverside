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


export const EditCompany=async(req:Request,res:Response):Promise<void>=>{
  const companyId=req.params.id
  const{name,contact,founder,foundedAt,IndustryType,address,socialMedia,services,workHours,about,employees}=req.body
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  company.name=name
  company.contact=contact
  company.founder=founder
  company.foundedAt=foundedAt
  company.about=about
  company.IndustryType=IndustryType
  company.address=address
  company.socialMedia=socialMedia
  company.services=services
  company.workHours=workHours
  company.employees=employees||[]

await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}
export const LogoOfCompany=async(req:Request,res:Response):Promise<void>=>{

  const companyId=req.params.id
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  if(req.file){
    company.logo=req.file.path
  }


  await company.save()
res.status(200).json({status:true,message:'successfully updated',company})

}




export const BannerOfCompany=async(req:Request,res:Response):Promise<void>=>{

  const companyId=req.params.id
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  

  if(req.file){
    company.banner=req.file.path
  }

  await company.save()
res.status(200).json({status:true,message:'successfully updated',company})

}


export const allUsersforCompany=async(req:Request,res:Response):Promise<void>=>{

  const {query}=req.query
    console.log("query",query);
    
    if(!query){
      throw new CustomError(`query is required`,400)
    }
  
    
  
    const users=await User.find({firstName:{ $regex: query, $options: "i" }})
  
    if(!users){
      throw new CustomError(`users not found`,404)
    }
    
    res.status(200).json({status:true,message:'success',users})
}