
import { Request, Response } from "express";
import mongoose from "mongoose";

import { Comment } from "../../../Model/CommentSchema";
import { Reply } from "../../../Model/CommentSchema";
import { Post } from "../../../Model/PostSchema";


const replyToComment = async (req: Request, res: Response): Promise<void> => {


    const { postId, commentId, userId, replyText } = req.body;


    if (!postId || !commentId || !userId || !replyText) {
        res.status(400).json({ error: "All fields are required" });
        return
    }
    console.log("postId", postId)

    const post = await Post.findById(postId);
    console.log("post", post)
    console.log("check", !post)


    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return
    }


    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return
    }
    console.log("comment", comment)


    const reply = new Reply({
        user: new mongoose.Types.ObjectId(userId),
        reply: replyText,
        repliedAt: new Date(),
    });


    await reply.save();
    console.log("reply", reply)
    console.log("reply", reply)


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
            res.status(400).json({ error: "Comment ID, Reply ID, and new reply text are required" });
            return;
        }

   
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        const replyIndex = comment.replies.findIndex((replyId) => replyId.toString() === replayedId);
        if (replyIndex === -1) {
            res.status(404).json({ error: "Reply not found in the comment" });
            return;
        }

        
        const reply = await Reply.findById(replayedId);
        if (!reply) {
            res.status(404).json({ error: "Reply not found" });
            return;
        }

        reply.reply = newReplyText;
        await reply.save(); 

        res.status(200).json({ success: true, message: "Reply updated successfully", updatedReply: reply });

    
};





export { replyToComment,getRepliesForComment,editReply };
