// import { Request,Response } from "express"
// import { Save } from "../../model/SaveSchema"


// export const SavedpostOfCompany=async(req:Request,res:Response):Promise<void>=>{
//     const companyid=req.user?.id
//     const saved=await Save.find({userId:companyid})

//     res.status(200).json({ status:true,message:'saveds',saved})

// }