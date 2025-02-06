import { Request, Response } from "express";
import { Post } from "../../../Model/PostSchema";
import { Report } from "../../../Model/ReportSchema";
import mongoose from "mongoose";

// Get all posts
const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await Post.find().populate("owner");
  const totalPosts = await Post.countDocuments(); // Fetch posts without authentication checks
  res.status(200).json({ posts, totalPosts });
};

// Function to Add a New Post
export const addPost = async (req: Request, res: Response): Promise<void> => {
   const { description } = req.body;
 
   // Validate description and owner fields
   if (!description || !req.user?.id) {
      res.status(400).json({ message: "Description and owner are required" });
   }
 
   // Type assertion to specify the structure of req.files
   const postMedia = (req.files as { [fieldname: string]: Express.Multer.File[] }).media;
 
   // Ensure media exists (either image or video)
   let mediaUrl: string | null = null;
   if (postMedia && postMedia.length > 0) {
     const file = postMedia[0]; // Retrieve the uploaded media  
     mediaUrl = file.path;
     console.log(mediaUrl) // URL of the uploaded media (image or video)
   } else {
      res.status(400).json({ message: "No media uploaded" });
   }
 
   
     // Create the new post with description, owner, and media
     const newPost = new Post({
       description,
       owner:req.user?.id,
       media: mediaUrl, // Add media URL to the post
     });
 
     // Save the post to the database
     await newPost.save();
 
     // Send success response with the created post details
     res.status(201).json({
       message: "Post uploaded successfully",
       post: newPost,
     });
  
 };

//  Get Posts by user
const getPostsByOwner = async (req: Request, res: Response): Promise<void> => {
  const { ownerId } = req.params; // Fetch ownerId from route params

  // Validate ownerId
  if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
    res.status(400).json({ error: "Valid Owner ID is required" });
    return;
  }

  // Fetch posts by the specified owner
  const posts = await Post.find({ owner: ownerId }).populate("owner");

  // If no posts found
  if (!posts || posts.length === 0) {
    res.status(404).json({ error: "No posts found for this owner" });
    return;
  }

  //  the posts in the response
  res.status(200).json({ posts });
  return;
};

const getpostbyid = async (req: Request, res: Response): Promise<void> => {
  const onepost = await Post.findById(req.params.id).populate("comments");
  console.log(onepost);

  res.json({ onepost });
};

const LikeOrDislike = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  const postId = req.params.postid;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID missing" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ message: "Invalid post ID" });
    return;
  }

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const likedIndex = post.likedBy.findIndex((id) => id.equals(userObjectId));

  if (likedIndex === -1) {
    post.likedBy.push(userObjectId);
    await post.save();
    res.status(200).json({ message: "Post liked successfully", post });
  } else {
    post.likedBy.splice(likedIndex, 1);
    await post.save();
    res.status(200).json({ message: "Post disliked successfully", post });
  }
};

const ReportPost = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID missing" });
    return;
  }
  const { reason, postId } = req.body;
  console.log("postId", postId);
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ error: "Valid Post ID is required" });
    return;
  }

  if (!reason || reason.trim() === "") {
    res.status(400).json({ error: "Comment cannot be empty" });
    return;
  }
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const report = new Report({
    reportedBy: userId,
    reason,
  });
  await report.save();

  if (!post.reports) {
    post.reports = [];
  }

  post.reports.push(report.id);
  await post.save();
  res.status(200).json({ message: "reported successfully", report });
};

export { getAllPosts, getPostsByOwner, getpostbyid, LikeOrDislike, ReportPost };
