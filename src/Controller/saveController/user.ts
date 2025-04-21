import { Request, Response } from "express";
import { Post } from "../../model/PostSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Save } from "../../model/SaveSchema";


export const SaveandUnsavePost=async(req:Request,res:Response):Promise<void>=>{
    const userId=req.user?.id
    const postId=req.params.id
    const post=await Post.findById(postId)
    if(!post){
        throw new CustomError("post not found",404)
    }

     
     const existingSave = await Save.findOne({ userId, postId });

     if (existingSave) {
        
         await Save.findByIdAndDelete(existingSave._id);
          res.status(200).json({ status: true, message: "Post unsaved" })
          return
     } else {
        
         const saved = new Save({ userId, postId });
         await saved.save();
          res.status(200).json({ status: true, message: "Post saved", saved })
          return
     }
}

export const AllSaved=async(req:Request,res:Response):Promise<void>=>{
    const userid=req.user?.id
    const saved=await Save.find({userId:userid}) .populate({
        path: 'postId',
        populate: {
            path: 'owner', // Populate the 'owner' field inside 'postId'
        },
    });

    res.status(200).json({ status:true,message:'saveds',saved})

}

// export const All=async(req:Request,res:Response):Promise<void>=>{
//     const userid=req.user?.id
//     const saved=await Save.find({userId:userid})

//     res.status(200).json({ status:true,message:'saveds',saved})

// }