import { Request, Response } from "express";
import { Comment } from "../../model/CommentSchema";
import { Reply } from "../../model/CommentSchema";
import { Post } from "../../model/PostSchema";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";

//reply to a comment
export const replyToComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { postId, commentId, replyText } = req.body;
  if (!postId || !commentId || !userId || !replyText) {
    throw new CustomError("All fields are required", 400);
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new CustomError("Post not found", 404);
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CustomError("Comment not found", 404);
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
  res
    .status(200)
    .json({ success: true, message: "Reply added successfully", reply });
};

// get all the reply of a perticular comment
export const getRepliesForComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new CustomError("Comment ID is required", 400);
  }

  const comment = await Comment.findById(commentId).populate({
    path: "replies",
    model: Reply,
    populate: {
      path: "user",
      model: User,
      select: "_id name profileImage email firstName",
    },
  });

  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  res.status(200).json({ success: true, replies: comment.replies });
};

//edit reply
export const editReply = async (req: Request, res: Response): Promise<void> => {
  const { newReplyText, commentId, replayedId } = req.body;

  if (!commentId || !replayedId || !newReplyText) {
    throw new CustomError(
      "Comment ID, Reply ID, and new reply text are required",
      400
    );
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  const replyIndex = comment.replies.findIndex(
    (replyId) => replyId.toString() === replayedId
  );
  if (replyIndex === -1) {
    throw new CustomError("Reply not found in the comment", 404);
  }

  const reply = await Reply.findById(replayedId);
  if (!reply) {
    throw new CustomError("Reply not found", 404);
  }

  reply.reply = newReplyText;
  await reply.save();

  res
    .status(200)
    .json({
      success: true,
      message: "Reply updated successfully",
      updatedReply: reply,
    });
};

//delete a reply
export const deleteReply = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  const { commentId, replayId } = req.body;

  if (!commentId) {
    throw new CustomError("Comment ID not found", 400);
  }
  if (!replayId) {
    throw new CustomError("Reply ID not found", 400);
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CustomError("Comment not found", 401);
  }
  if (!comment.replies.includes(replayId)) {
    throw new CustomError("Reply ID not found in replies", 401);
  }
  const reply = await Reply.findById(replayId);
  if (!reply) {
    throw new CustomError("Reply not found", 404);
  }

  if (reply.user.toString() !== userId) {
    throw new CustomError("You can only delete your own replies", 403);
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

//get the comments with reply
export const getCommentsWithReplies = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  res
    .status(200)
    .json({ success: true, message: "found it comments", comments });
};
