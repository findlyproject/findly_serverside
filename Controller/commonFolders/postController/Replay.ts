import { Request, Response } from "express";
import  Post from "../../../Model/PostSchema"; 

export const replyToPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, reply } = req.body;

    
    if (!userId || !reply) {
      return res.status(400).json({ message: "User ID and reply text are required." });
    }

  
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          replies: {
            user: userId,
            reply: reply,
            repliedAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("replies.user", "username"); 

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
