import express from "express";
// import { addPost } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'

import { userAuthMiddleware } from "../../Middleware/userauthantication";
import { deleteReplay, editReply, getRepliesForComment, replyToComment } from "../../Controller/commonFolders/postController/Replay";
import { LikeOrDislike } from "../../Controller/commonFolders/postController/Post";
const postRouter = express.Router();


postRouter
// .post("/post",upload.array("media", 5),errorCatch(addPost));
.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))
.get("/user/findreply/:commentId",userAuthMiddleware,errorCatch(getRepliesForComment))
.get("/user/editreplay",userAuthMiddleware,errorCatch(editReply))
.delete("/user/deletereplay",userAuthMiddleware,errorCatch(deleteReplay))
.post("/user/likepost/:postid",userAuthMiddleware,errorCatch(LikeOrDislike))

export default postRouter;
 