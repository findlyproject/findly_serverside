
import { Request, Response } from "express";
import mongoose from "mongoose";

import { Comment } from "../../../Model/CommentSchema";
import { Reply } from "../../../Model/CommentSchema";
import { Post } from "../../../Model/PostSchema";


const replyToComment = async (req: Request, res: Response):Promise<void> => {

 
    const { postId, commentId, userId, replyText } = req.body;

    
    if (!postId || !commentId || !userId || !replyText) {
       res.status(400).json({ error: "All fields are required" });
       return
    }
console.log("postId",postId)
   
    const post = await Post.findById(postId);
    console.log("post",post)
    console.log("check",!post)


    if (!post) {    
       res.status(404).json({ error: "Post not found" });
       return
    }
   
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
       res.status(404).json({ error: "Comment not found" });
       return
    }


    const reply = new Reply({
        user: new mongoose.Types.ObjectId(userId),
        reply: replyText,
        repliedAt: new Date(),
      });
  
  
      await reply.save();
  
    
    //   comment.replies.push(reply);
    await reply.save();
    await comment.save();


     res.status(200).json({ success: true, message: "Reply added successfully" });
 
};

export { replyToComment };
