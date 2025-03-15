import express from "express";
import {
  getpostbyid,
  getPostsByOwners,
  addPost,
  getAllPosts,
  updatePost,
  DeletePost,
} from "../Controller/postController/user";
import { upload } from "../middleware/upload";
import { errorCatch } from "../middleware/tryCatch";
import {
  getCommentById,
  addCommentToPost,
  editComment,
  deleteComment,
  getAllComments,
} from "../Controller/commentController/user";
import { companyAuth, userAuth } from "../middleware/userauthantication";
import {
  deleteReply,
  editReply,
  getCommentsWithReplies,
  getRepliesForComment,
  replyToComment,
} from "../Controller/replyController/user";
import { LikeOrDislike } from "../Controller/postController/user";   
import { validateData } from "../middleware/zodValidation";
import { CommentSchema, IdSchema, ReplySchema } from "../Utils/zodSchema";
import { ReportPost } from "../Controller/reportController/user";
const postRouter = express.Router();

postRouter

  //post
  .get("/allposts", errorCatch(getAllPosts))
  .get("/post/:id", errorCatch(getpostbyid))
  .get(
    "/owner",
    userAuth,
    errorCatch(getPostsByOwners)
  )
  .post(
    "/upload",
    userAuth,
    upload.fields([{ name: "media", maxCount: 5 }]),
    addPost
  )
  .patch(
    "/update/:postId",
    userAuth,
    upload.fields([{ name: "media", maxCount: 5 }]),
    errorCatch(updatePost)
  )
  .put("/delete/:postId",userAuth, errorCatch(DeletePost))

  
  //report
  .post("/user/reportpost", userAuth, errorCatch(ReportPost))

  .post("/company/reportpost", companyAuth, errorCatch(ReportPost))
export default postRouter;
