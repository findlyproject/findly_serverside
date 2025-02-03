import { Request, Response } from "express";
import { Post } from "../../../Model/PostSchema";
import { Report } from "../../../Model/ReportSchema";
import mongoose from "mongoose";

// // Function to Add a New Post
// export const addPost = async (req: Request, res: Response):Promise<void> => {
//   try {
//     const { description, owner } = req.body;

//     // Validate Owner ID
//     if (!owner || !mongoose.Types.ObjectId.isValid(owner)) {
//        res.status(400).json({ error: "Valid Owner ID is required" });
//        return
//     }

//     let mediaUrls: string[] = [];

//     // Check if files were uploaded
//     if (req.files) {
//       if (Array.isArray(req.files)) {
//         mediaUrls = req.files.map((file: Express.Multer.File) => file.path);
//       } else if (req.files["images"]) {
//         mediaUrls = (req.files["images"] as Express.Multer.File[]).map(file => file.path);
//       }
//     } else if (req.file) {
//       mediaUrls = [req.file.path];
//     }

//     // Create new post
//     const newPost = new Post({
//       description,
//       owner,
//       images: mediaUrls.length > 0 ? mediaUrls : undefined,
//     });

//     await newPost.save();

//      res.status(201).json({ message: "Post created successfully", post: newPost })
//      return;
//   } catch (error) {
//     console.error("Error adding post:", error);
//      res.status(500).json({ error: "Internal Server Error" })
//      return;
//   }
// };

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

export { getPostsByOwner, getpostbyid, LikeOrDislike, ReportPost };
