import { Request, Response } from "express";
import mongoose from "mongoose";
import { Post } from "../../../Model/PostSchema"; // Ensure correct import path

export const replyToComment = async (req: Request, res: Response) :Promise<void>=> {

    const { postId, commentId } = req.params; 
    const { userId, replyText } = req.body;  

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
       res.status(400).json({ success: false, message: "Invalid post or comment ID" });
       return
    }


    const post = await Post.findById(postId);
    if (!post) {
       res.status(404).json({ success: false, message: "Post not found" });
       return
    }

   
    const comment = post.comments.find((c) => c._id.equals(commentId));
    if (!comment) {
       res.status(404).json({ success: false, message: "Comment not found" });
       return
    }

    // Add the reply
    comment.replies.push({
      user: new mongoose.Types.ObjectId(userId),
      reply: replyText,
      repliedAt: new Date(),
    });

    await post.save(); // Save the updated post

     res.status(200).json({ success: true, message: "Reply added successfully", post });

};
