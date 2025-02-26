import express from "express";
import {
  getpostbyid,
  getPostsByOwner,
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
import { userAuthMiddleware } from "../middleware/userauthantication";
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
  .get("/allposts", getAllPosts)
  .get("/post/:id", errorCatch(getpostbyid))
  .get(
    "/owner/:ownerId",
    userAuthMiddleware,
    validateData(IdSchema),
    errorCatch(getPostsByOwner)
  )
  .post(
    "/upload",
    userAuthMiddleware,
    upload.fields([{ name: "media", maxCount: 5 }]),
    addPost
  )
  .patch(
    "/update/:postId",
    userAuthMiddleware,
    upload.fields([{ name: "media", maxCount: 5 }]),
    errorCatch(updatePost)
  )
  .put("/delete/:postId",userAuthMiddleware, errorCatch(DeletePost))

  //like & unlike
  .post(
    "/user/likepost/:id",
    userAuthMiddleware,

    validateData(undefined,IdSchema),

    errorCatch(LikeOrDislike)
  )

  //comment
  .get("/allcomments", errorCatch(getAllComments))
  .get(
    "/viewcomment/:id",
    userAuthMiddleware,
    validateData(IdSchema),
    errorCatch(getCommentById)
  )
  .post(
    "/comment",
    userAuthMiddleware,
    validateData(CommentSchema),
    errorCatch(addCommentToPost)
  )
  .put(
    "/edit-comment/:commentId",
    userAuthMiddleware,
    validateData(CommentSchema, IdSchema),
    errorCatch(editComment)
  )
  .post(
    "/delete-comment/:commentId",
    userAuthMiddleware,
    validateData(IdSchema),
    errorCatch(deleteComment)
  )

  //reply
  .post(
    "/user/postreplay",
    userAuthMiddleware,
    validateData(ReplySchema),
    errorCatch(replyToComment)
  )
  .get(
    "/user/findreply/:commentId",
    userAuthMiddleware,
    errorCatch(getRepliesForComment)
  )
  .put("/user/editreplay", userAuthMiddleware, errorCatch(editReply))
  .delete("/user/deletereplay", userAuthMiddleware, errorCatch(deleteReply))
  .get(
    "/user/getcommentswithreplies",
    userAuthMiddleware,
    errorCatch(getCommentsWithReplies)
  )

  //report
  .post("/user/reportpost", userAuthMiddleware, errorCatch(ReportPost));

export default postRouter;
