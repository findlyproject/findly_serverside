import { json, Request, Response } from "express"
import { Admin } from "../../Model/AdminSchema";
import  jwt  from "jsonwebtoken";
import User from "../../Model/UserSchema";
import { Report } from "../../Model/ReportSchema";
import { Post } from "../../Model/PostSchema";


//user block and unblock
export const blocAndUnblock = async (req:Request,res:Response):Promise<void>=>{
    const userId = req.params.id;
    if(!userId){
        res.status(404).json({status:false,message:"Blockin user id is missing"})
        return
    }
    const findUser =await User.findOne({_id:userId});
    console.log(findUser);

    if(!findUser){
        res.status(404).json({status:false,message:"Blockin user is not found"})
        return
    }

    findUser.isBlocked = !findUser.isBlocked
    await findUser.save()
    
    res.status(200).json({status:true,message:`User ${findUser.isBlocked ? "block" : "unblock"} is sucssesfully`,data:findUser })
  } 

 // get all Users
export const allUsers = async (req:Request,res:Response):Promise<void>=>{
    const users = await User.find();
    const totalUsers = await User.countDocuments();
    // if (!users) {
    //   return  json("users not found", 404);
    // }
    res.status(200).json({ users, totalUsers });
  };

  
// get all reports
export const getReports = async (req:Request,res:Response):Promise<void>=>{
    const reports = await Report.find().populate("reportedBy")
    res.status(200).json({ reports });
  };
  

  // dismiss reports of a post
  export const dismissReports = async (req: Request, res: Response): Promise<void> => {
      const postId = req.params.id;
  
      const post = await Post.findById(postId).select("reports");
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
  
      const updatedReports = await Report.updateMany(
        { _id: { $in: post.reports } },
        { $set: { isDeleted: true } }
      );
  
      if (updatedReports.matchedCount === 0) {
        res.status(404).json({ message: "No reports found for this post" });
        return;
      }
  
      await Post.findByIdAndUpdate(postId, { $set: { reports: [] } });
  
      res.status(200).json({ message: "Reports dismissed successfully" });
    }
  
  

  //delete a post
  export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;
  
      // Update post by setting isDeleted to true
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { isDeleted: true } },
        { new: true } // Return the updated post
      );
  
      if (!updatedPost) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
  
      res.status(200).json({ message: "Post marked as deleted", updatedPost });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };