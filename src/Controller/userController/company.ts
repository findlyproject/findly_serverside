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
  const{about}=req.body
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  // company.name=name
  // company.contact=contact
  // company.founder=founder
  // company.foundedAt=foundedAt
  company.about=about
  // company.IndustryType=IndustryType
  // company.address=address
  // company.socialMedia=socialMedia
  // company.services=services
  // company.workHours=workHours
  // company.employees=employees||[]

await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}

export const EditContacts=async(req:Request,res:Response):Promise<void>=>{
  const companyId=req.params.id
  const{name,contact,founder,email}=req.body
  console.log("nameeeeeeeeeeeeeeeeeeeeeeeeeee",name);
  
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  company.name=name
  company.contact=contact
  company.founder=founder
  company.email=email
  // company.foundedAt=foundedAt
  // company.about=about
  // company.IndustryType=IndustryType
  // company.address=address
  // company.socialMedia=socialMedia
  // company.services=services
  // company.workHours=workHours
  // company.employees=employees||[]

await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}


export const EditProfetional=async(req:Request,res:Response):Promise<void>=>{
  const companyId=req.params.id
  const{name,address,email}=req.body
  console.log("narrrrrrrrrrrrrrrrrrrrrrr",name);
  console.log("address",address);
  
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }

  company.name=name
 
  company.email=email
  // company.foundedAt=foundedAt
  // company.about=about
  // company.IndustryType=IndustryType
  company.address=address
  // company.socialMedia=socialMedia
  // company.services=services
  // company.workHours=workHours
  // company.employees=employees||[]

await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}


export const EditServiecs=async(req:Request,res:Response):Promise<void>=>{
  const companyId=req.params.id
  const{services}=req.body
  console.log("narrrrrrrrrrrrrrrrrrrrrrr",services);
  console.log("req.body",req.body);
  
  
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }


  company.services=services
  

await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}

export const editsocialmedia=async(req:Request,res:Response):Promise<void>=>{
  const companyId=req.params.id
  const{socialMedia}=req.body
console.log("socialMedia",socialMedia);

  
  const company=await Company.findById(companyId)
  if(!company){
    throw new CustomError("company not found",404)
  }


  company.socialMedia=socialMedia


await company.save()
res.status(200).json({status:true,message:'successfully edited',company})
}




export const removeEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { email } = req.body;
    console.log("req.body",req.body);
    

    // 1. Find company
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    // 2. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // 3. Remove employee from company
    const updatedEmployees = company.employees.filter(
      (emp) => emp.employee.toString() !== user._id.toString()
    );

    company.employees = updatedEmployees;

    await company.save();

    const updatedCompany = await Company.findById(companyId).populate("employees.employee");

    res.status(200).json({
      status: true,
      message: "Employee removed successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error removing employee:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};



export const editemployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { employee, position, email } = req.body.employees

    console.log("body",req.body);
    

    // 1. Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({success:false,message:"company not found"})
      return
    }

 console.log("emm",email);
 
    const user = await User.findOne({ email });
    if (!user) {
       res.status(404).json({success:false,message:"User not found"})
       return
    }
 
    // 3. Check if employee already exists in company
    const existingIndex = company.employees.findIndex(
      (emp) => emp.employee.toString() === user._id.toString()
    );

    if (existingIndex !== -1) {
      // Update position if already exists
      company.employees[existingIndex].position = position;
    } else {
      // Push new employee
      company.employees.push({
        employee: user._id,
        position: position,
      });
    }

    await company.save();

    // 4. Populate employee data for response
    const updatedCompany = await Company.findById(companyId).populate("employees.employee");

    res.status(200).json({
      status: true,
      message: "Successfully edited employees",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};




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