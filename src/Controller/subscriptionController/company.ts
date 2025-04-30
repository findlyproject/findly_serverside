import { SubscriptionPlan } from "../../model/SubscriptionSchema"


import { Request, Response } from "express";

export const PremiumDetailsOfActiveCompany=async(req:Request,res:Response):Promise<void>=>{
  const userId=req.user?.id
  
  const subscription=await SubscriptionPlan.find({companyId:userId})

res.status(200).json({status:true,message:"subscription details",subscription})
}