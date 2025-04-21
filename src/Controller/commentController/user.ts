import { Request, Response } from "express";
import { Post } from "../../model/PostSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Comment } from "../../model/CommentSchema";

// Get all comments
export const getAllComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const comments = await Comment.find().populate("user");
  const totalComments = await Comment.countDocuments();
  res.status(200).json({
    status: true,
    message: "Got all the comments",
    comments,
    totalComments,
  });
};

// Comment on a Post
export const addCommentToPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId, comment } = req.body;
console.log(req.body)
  if (!comment || comment.trim() === "") {
    throw new CustomError("Comment cannot be empty", 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  const newComment = new Comment({
    user: req.user?.id,
    comment,
    userModel:req.user?.type==='Company'?'Company':'User',
  });

  await newComment.save();

  if (!post.comments) {
    post.comments = [];
  }
  post.comments.push(newComment.id);

  await post.save();
  const populatedComment = await Comment.findById(newComment._id)
    .populate("user")
    .exec();

  res.status(201).json({
    status: true,
    message: "Comment added successfully",
    comment: populatedComment,
  });
};

// update a comment by id
export const editComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { newComment } = req.body;
  const { commentId } = req.params;

  if (!newComment || newComment.trim() === "") {
    throw new CustomError("Comment cannot be empty", 400);
  }

  const comment = await Comment.findById(commentId).populate("user");
  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  if (comment.user._id.toString() !== req.user?.id) {
    throw new CustomError(
      "Unauthorized: You can only edit your own comments",
      403
    );
  }
  comment.comment = newComment;
  await comment.save();

  res.status(200).json({
    status: true,
    message: "Comment updated successfully",
    comment,
  });
  return;
};

// Delete a Comment
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  if (comment.user.toString() !== req.user?.id) {
    throw new CustomError(
      "Unauthorized: You can only delete your own comments",
      403
    );
  }

  comment.isDeleted = true;
  await comment.save();

  res.status(200).json({
    status: true,
    message: "Comment marked as deleted successfully",
    comment,
  });
};

// get a comment by ID
export const getCommentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("req.params.id", req.params.id);
  const comment = await Comment.findById(req.params.id).populate("user");
console.log(comment)
  if (!comment) {
    throw new CustomError("No post found containing this comment", 404);
  }

  const commented = comment.comment;

  if (!commented) {
    throw new CustomError("Comment not found", 404);
  }
  res.status(200).json({ status: true, message: "Comment found", comment });
  return;
};
