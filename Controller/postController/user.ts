import { Request, Response } from "express";
import { Post } from "../../model/PostSchema";
import { Report } from "../../model/ReportSchema";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CustomError } from "../../Utils/errorHandler";

// Get all posts
export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const posts = await Post.find()
    .populate("owner")
    .populate("reports")
    .populate("likedBy", "firstName lastName profileImage")
    .populate({
      path: "comments",
      match: { isDeleted: false },
      populate: {
        path: "user",
        select: "firstName lastName profileImage ",
      },
    });
  const totalPosts = await Post.countDocuments();
  res.status(200).json({
    status: true,
    message: "Got all the posts and count",
    posts,
    totalPosts,
  });
};

export const addPost = async (req: Request, res: Response): Promise<void> => {
  const { description } = req.body;

  if (!description || !req.user?.id) {
    throw new CustomError("Description and owner are required", 400);
  }

  if (!req.files) {
    throw new CustomError("No media uploaded", 400);
  }

  const uploadedImages: string[] = [];
  let uploadedVideo: string | null = null;

  if ("media" in req.files) {
    const mediaFiles = req.files["media"] as Express.Multer.File[];

    for (const file of mediaFiles) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "posts/media",
      });

      if (file.mimetype.startsWith("image/")) {
        uploadedImages.push(result.secure_url);
      } else if (file.mimetype.startsWith("video/")) {
        uploadedVideo = result.secure_url;
      }
    }
  }

  const newPost = new Post({
    description,
    owner: req.user.id,
    images: uploadedImages,
    video: uploadedVideo,
  });
  

  await newPost.save();

  res.status(201).json({
    status: true,
    message: "Post uploaded successfully",
    post: newPost,
  });
};

//  Get Posts by user
export const getPostsByOwner = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ownerId } = req.params;

  const posts = await Post.find({ owner: ownerId }).populate("owner");

  if (!posts || posts.length === 0) {
    throw new CustomError("No posts found for this owner", 404);
  }

  res
    .status(200)
    .json({ status: true, message: "Got the posts by the owner", posts });
  return;
};

//get post by id
export const getpostbyid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const onepost = await Post.findById(req.params.id).populate("comments owner");

  res.status(200).json({ status: true, message: "Got post by ID", onepost });
};

//like or dislike
export const LikeOrDislike = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;


  const postId = req.params.id;
 
  

  if (!userId) {
    throw new CustomError("Unauthorized: User ID missing", 401);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const likedIndex = post.likedBy.findIndex((id) => id.equals(userObjectId));

  if (likedIndex === -1) {
    post.likedBy.push(userObjectId);
    await post.save();
    res
      .status(200)
      .json({ status: true, message: "Post liked successfully", post });
  } else {
    post.likedBy.splice(likedIndex, 1);
    await post.save();
    res
      .status(200)
      .json({ status: true, message: "Post disliked successfully", post });
  }
};
