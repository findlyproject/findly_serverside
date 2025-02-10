import { Request, Response } from "express";
import { Post } from "../../../model/PostSchema";
import { Report } from "../../../model/ReportSchema";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Get all posts
const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await Post.find().populate("owner")
  .populate("reports", "reportedBy reason") 
  .populate("likedBy", "firstName lastName profileImage")
  .populate({
    path: "comments",  
    match: { isDeleted: false },// only get comments.isDeleted=false
    populate: {
      path: "user",
      select: "firstName lastName profileImage ", // Only fetch required fields
    },
  });
  const totalPosts = await Post.countDocuments(); // Fetch posts without authentication checks
  res.status(200).json({ posts, totalPosts });  
};



export const addPost = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received Files:", req.files);
    const { description } = req.body;
    console.log(req.body)
    const media = req.files;

    console.log("media files",req.files);
    

    if (!description || !req.user?.id) {
      res.status(400).json({ message: "Description and owner are required" });
      return;
    }

    if (!req.files) {
      res.status(400).json({ message: "No media uploaded" });
      return;
    }

    // ✅ `req.files` is an object when using `upload.fields()`
    const uploadedImages: string[] = [];
    let uploadedVideo: string | null = null;

    // ✅ Process images
    if ("media" in req.files) {
      const mediaFiles = req.files["media"] as Express.Multer.File[];

      for (const file of mediaFiles) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "posts/media",
        });

        // ✅ Categorize as image or video
        if (file.mimetype.startsWith("image/")) {
          uploadedImages.push(result.secure_url);
        } else if (file.mimetype.startsWith("video/")) {
          uploadedVideo = result.secure_url;
        }
      }
    }

    // ✅ Create new post
    const newPost = new Post({
      description,
      owner: req.user.id,
      images: uploadedImages, // Store image URLs
      video: uploadedVideo, // Store video URL
    });

    await newPost.save();

    res.status(201).json({
      message: "Post uploaded successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
