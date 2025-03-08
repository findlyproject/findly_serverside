import  mongoose from "mongoose"
import { Request, Response } from "express";
import { Post } from "../../model/PostSchema";
import { CustomError } from "../../Utils/errorHandler";

export const getPostsByOwner = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const ownerId  = req.user?.id
    
  
    const posts = await Post.find({ owner: ownerId }).populate({path:"owner",match:{type:"Company"}});  

     
    console.log("posts",posts);
    
    res
      .status(200)
      .json({ status: true, message: "Got the posts by the owner", posts });
    return;
  };