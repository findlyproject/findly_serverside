import { Request, Response } from "express";
import { Report } from "../../model/ReportSchema";
import { Post } from "../../model/PostSchema";
import { CustomError } from "../../Utils/errorHandler";

// get all reports
export const getReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reports = await Report.find().populate("reportedBy");
  res
    .status(200)
    .json({ status: "success", massage: "Got all the reports", reports });
};

// dismiss reports of a post
export const dismissReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  const postId = req.params.id;

  const post = await Post.findById(postId).select("reports");
  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  const updatedReports = await Report.updateMany(
    { _id: { $in: post.reports } },
    { $set: { isDeleted: true } }
  );

  if (updatedReports.matchedCount === 0) {
    throw new CustomError("No reports found for this post", 404);
  }

  await Post.findByIdAndUpdate(postId, { $set: { reports: [] } });

  res
    .status(200)
    .json({ status: "success", message: "Reports dismissed successfully" });
};

//delete a post
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const postId = req.params.id;

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!updatedPost) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res
    .status(200)
    .json({
      status: "success",
      message: "Post marked as deleted",
      updatedPost,
    });
};
