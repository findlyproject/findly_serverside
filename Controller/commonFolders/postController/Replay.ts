
import { Request, response, Response } from "express";
import mongoose from "mongoose";

import { Comment } from "../../../model/CommentSchema";
import { Reply } from "../../../model/CommentSchema";
import { Post } from "../../../model/PostSchema";
import User from "../../../model/UserSchema"
import { CustomError } from "../../../Utils/CustomError";

const replyToComment = async (req: Request, res: Response): Promise<void> => {
    if(!req.user){
      throw new CustomError("Unauthorized")
        res.status(404).json({success:false,message:"Unauthorized"})
        return
    }

const userId =req.user?.id
    const { postId, commentId,  replyText } = req.body;
    if (!postId || !commentId || !userId || !replyText) {
        res.status(400).json({ error: "All fields are required" });
        return
    }
    const post = await Post.findById(postId);
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
        user: userId,
        reply: replyText,
        repliedAt: new Date(),
    });
    await reply.save();
    comment.replies.push(reply.id);
    await reply.save();
    await comment.save();
    res.status(200).json({ success: true, message: "Reply added successfully",reply });

};



const getRepliesForComment = async (req: Request, res: Response): Promise<void> => {
  
        const { commentId } = req.params;

        if (!commentId) {
            res.status(400).json({ error: "Comment ID is required" });
            return;
        }


        const comment = await Comment.findById(commentId).populate({
            path: "replies",
            model: Reply, 
            populate: {
                path: "user",  
                model: User,   
                select: "_id name profileImage email firstName" 
            }
        });

        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        res.status(200).json({ success: true, replies: comment.replies });
   
};



const editReply = async (req: Request, res: Response): Promise<void> => {
 
 
        const { newReplyText,commentId,replayedId } = req.body;

        if (!commentId || !replayedId || !newReplyText) {
            res.status(400).json({success:false, error: "Comment ID, Reply ID, and new reply text are required" });
            return;
        }

   
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({success:false, error: "Comment not found" });
            return;
        }

        const replyIndex = comment.replies.findIndex((replyId) => replyId.toString() === replayedId);
        if (replyIndex === -1) {
            res.status(404).json({success:false, error: "Reply not found in the comment" });
            return;
        }

        
        const reply = await Reply.findById(replayedId);
        if (!reply) {
            res.status(404).json({success:false, error: "Reply not found" });
            return;
        }

        reply.reply = newReplyText;
        await reply.save(); 

        res.status(200).json({ success: true, message: "Reply updated successfully", updatedReply: reply });

    
};


const deleteReply = async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
  
      const { commentId, replayId } = req.body;

      if (!commentId) {
        res.status(400).json({ success: false, message: "Comment ID not found" });
        return;
      }
      if (!replayId) {
        res.status(400).json({ success: false, message: "Reply ID not found" });
        return;
      }
      const comment = await Comment.findById(commentId);
      if (!comment) {
        res.status(404).json({ success: false, message: "Comment not found" });
        return;
      }
      if (!comment.replies.includes(replayId)) {
        res.status(404).json({ success: false, message: "Reply ID not found in replies" });
        return;
      }
      const reply = await Reply.findById(replayId);
      if (!reply) {
        res.status(404).json({ success: false, message: "Reply not found" });
        return;
      }
  
      if (reply.user.toString() !== userId) {
        res.status(403).json({ success: false, message: "You can only delete your own replies" });
        return;
      }
      const deletedReply = await Reply.findByIdAndUpdate(
        replayId,
        { isDeleted: true },
        { new: true }
      );
      const activeReplies = await Reply.find({ commentId, isDeleted: false });
      res.status(200).json({
        success: true,
        message: "Reply deleted successfully",
        deletedReply,
        replies: activeReplies,
      });
  
  
  };
  

  const getCommentsWithReplies = async (req:Request,res:Response):Promise<void> => {
      const comments = await Comment.find({ isDeleted: false })
        .populate({
          path: "replies",
          match: { isDeleted: false },
        })
        .exec();
        if (!comments.length) {
            res.status(404).json({
              success: false,
              message: "No comments found",
            });
            return;
          }
       res.status(200).json({success:true,message:"found it comments",comments})
  };
  
  

export { replyToComment,getRepliesForComment,editReply,deleteReply,getCommentsWithReplies};
