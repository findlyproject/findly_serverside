import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Report } from "../../model/ReportSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Post } from "../../model/PostSchema";

//report a post
export const ReportPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("Unauthorized: User ID missing", 401);
  }
  const { reason, postId } = req.body;

  if (!reason || reason.trim() === "") {
    throw new CustomError("Comment cannot be empty", 400);
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new CustomError("Post not found", 404);
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
  res
    .status(200)
    .json({ status: true, message: "reported successfully", report });
};

//report a user

export const reportuser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userid = req.user?.id;
  const { reason, repoteduserid } = req.body;

  if (!userid) {
    throw new CustomError("User ID is missing", 400);
  }

  const finduser = await User.findOne({ _id: repoteduserid });
  if (!finduser) {
    throw new CustomError("User not found", 404);
  }

  if (!repoteduserid) {
    throw new CustomError("Reported user ID is missing", 400);
  }

  const findreporteduser = await User.findOne({ _id: repoteduserid }).populate(
    "reports"
  );

  if (!findreporteduser) {
    throw new CustomError("Reported user not found", 404);
  }

  const report = new Report({
    reportedBy: userid,
    reason,
  });
  await report.save();

  if (!Array.isArray(findreporteduser.reports)) {
    findreporteduser.reports = [];
  }

  findreporteduser.reports.push(report.id);
  const a = await findreporteduser.save();
  const popuatedreports = await User.findOne({ _id: repoteduserid }).populate(
    "reports"
  );

  res
    .status(200)
    .json({ status: true, message: "Reported successfully", popuatedreports });
};
