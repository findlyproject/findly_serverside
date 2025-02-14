import { Request, Response } from "express";
import { Comment } from "../../../model/CommentSchema";
import { Post } from "../../../model/PostSchema";

// Get all comments
export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  const comments = await Comment.find().populate("user");
  const totalComments = await Comment.countDocuments(); 
  res.status(200).json({status:"success",message:"Got all the comments", comments, totalComments });  
};

// Comment on a Post
export const addCommentToPost = async (req: Request, res: Response): Promise<void> => {
  const { postId, comment } = req.body;
 
  if (!comment || comment.trim() === "") {
    res.status(400).json({ error: "Comment cannot be empty" });
    return;
  }

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const newComment = new Comment({
    user: req.user?.id,
    comment,
  });

  await newComment.save();

  if (!post.comments) {
    post.comments = [];
  }
  post.comments.push(newComment.id);

  await post.save();
  const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "firstName lastName email profileImage") 
      .exec();

  res
    .status(201)
    .json({status:"success", message: "Comment added successfully", comment: populatedComment });
};

// update a comment by id
export const editComment = async (req: Request, res: Response): Promise<void> => {
  const {  newComment } = req.body;
  const {  commentId } = req.params;

  

  
  if (!newComment || newComment.trim() === "") {
    res.status(400).json({ error: "Comment cannot be empty" });
    return;
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.user.toString() !== req.user?.id) {
    res
      .status(403)
      .json({ error: "Unauthorized: You can only edit your own comments" });
    return;
  }
  comment.comment = newComment;
  await comment.save();

  res
    .status(200)
    .json({status:"success", message: "Comment updated successfully", comment });
  return;
};

// Function to Delete a Comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const {commentId } = req.params;


  // Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
  }

  // Ensure the user owns the comment before marking as deleted
  if (comment.user.toString() !== req.user?.id) {
      res.status(403).json({ error: "Unauthorized: You can only delete your own comments" });
      return;
  }

  comment.isDeleted = true;
  await comment.save(); 

  res.status(200).json({status:"success", message: "Comment marked as deleted successfully" ,comment});
};

// get a comment by ID
export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404).json({ message: "No post found containing this comment" });
    return;
  }

  const commented = comment.comment;
  
  if (!commented) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }
  res.status(200).json({status:"success", message: "Comment found", comment });
  return;
};


