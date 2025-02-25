import { Request, Response } from "express";
import { Community } from "../../model/CommunitySchema";
import { CustomError } from "../../Utils/errorHandler";
import mongoose from "mongoose";
export const createCommunity=async(req:Request,res:Response):Promise<void>=>{

   
    const userId=req.user?.id
    console.log("userId",userId);
    
    const {name,description,profile}=req.body
    console.log("{name,description,profile}",{name,description,profile})
    if(!userId){
        throw new CustomError('current user not found',404)
    }
    if(!name||!description){
        throw new CustomError('name and description is required',400)
    }
    const existingCommunity=await Community.findOne({name})
    if(existingCommunity){
        throw new CustomError('community already exists',400)
    }

    
   const community=new Community({
    name,
    description,
    createdBy:userId,
    profile,
    members:[userId]
   })
await community.save()

   res.status(201).json({status:true,message:"community created",community})
}


export const AllCommunities=async(req:Request,res:Response):Promise<void>=>{
    const communities=await Community.find()

    if(!communities){
        throw new  CustomError(`all communities not found`,404)
    }
res.status(200).json({status:true,message:'communities',communities})
}



export const joinCommunity =async(req:Request,res:Response):Promise<void>=>{
   
   const communityId=req.params.id
  const userId=req.user?.id
    // Check if the community exists
    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ message: 'Community not found' });
      return;
    }

    // Check if the user is already a member
    const isMember = community.members.some(
      (member) => member.toString() === userId
    );
    if (isMember) {
      res.status(400).json({ message: 'User is already a member' });
      return;
    }

    // Add user to the community
    community.members.push(new mongoose.Types.ObjectId(userId));

    // Save the updated community
    await community.save();

    res.status(200).json({ message: 'User joined the community successfully', community });
}