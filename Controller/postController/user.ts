import { Request, Response } from "express";
import { Post } from "../../model/PostSchema";
import { Report } from "../../model/ReportSchema";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CustomError } from "../../Utils/errorHandler";

// Get all posts
// export const getAllPosts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const posts = await Post.find({isDeleted: false})
//     .populate("owner")
//     .populate("reports")
//     .populate("likedBy", "firstName lastName profileImage")
//     .populate({
//       path: "comments",
//       match: { isDeleted: false },
//       populate: {
//         path: "user",
//       },
//     });
//   const totalPosts = await Post.countDocuments();
//   res.status(200).json({
//     status: true,
//     message: "Got all the posts and count",
//     posts,
//     totalPosts,
//   });
// };
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 5 } = req.query; 

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const posts = await Post.find({ isDeleted: false })
      .populate("owner")
      .populate("reports")
      .populate("likedBy", "firstName lastName profileImage")
      .populate({
        path: "comments",
        match: { isDeleted: false },
        populate: { path: "user" },
      })
      .sort({ createdAt: -1 }) // Sort by newest
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalPosts = await Post.countDocuments({ isDeleted: false });

    res.status(200).json({
      status: true,
      message: "Got paginated posts",
      posts,
      totalPosts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalPosts / limitNumber),
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
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

export const updatePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    const { description } = req.body;
console.log(req.params)
    if (!postId) {
      throw new CustomError("Post ID is required", 400);
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    // Check if the user is the owner of the post
    if (post.owner.toString() !== req.user?.id) {
      throw new CustomError("Unauthorized to update this post", 403);
    }

    // Handle new media uploads
    let uploadedImages: string[] = post.images || [];
    let uploadedVideo: string  = post.video || "";


    if (req.files && "media" in req.files) {
      const mediaFiles = req.files["media"] as Express.Multer.File[];

      // Delete existing media from Cloudinary if new files are uploaded
      if (uploadedImages.length > 0 || uploadedVideo) {
        for (const img of uploadedImages) {
          await cloudinary.uploader.destroy(img);
        }
        if (uploadedVideo) {
          await cloudinary.uploader.destroy(uploadedVideo);
        }
      }

      uploadedImages = [];
      uploadedVideo = "";

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

    // Update post details
    post.description = description || post.description;
    post.images = uploadedImages;
    post.video = uploadedVideo;

    await post.save();

    res.status(200).json({
      status: true,
      message: "Post updated successfully",
      post,
    });
 
};


//  Get Posts by user
export const getPostsByOwner = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ownerId  = req.user?.id

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

// delete 


export const DeletePost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    if (post.owner.toString() !== req.user?.id) {
      throw new CustomError("Unauthorized: You can only delete your own posts", 403);
    }

    post.isDeleted = true; // Soft delete
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post marked as deleted successfully",
      post,
    });
  
};

