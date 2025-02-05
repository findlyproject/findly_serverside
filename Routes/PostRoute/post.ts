import express from "express";
import {getpostbyid,getPostsByOwner, ReportPost,addPost } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../middleware/upload";
import {errorCatch} from '../../middleware/tryCatch'
import { getCommentById,addCommentToPost,editComment,deleteComment} from "../../Controller/commonFolders/postController/Comment";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { deleteReplay, editReply, getRepliesForComment, replyToComment } from "../../Controller/commonFolders/postController/Replay";
import { LikeOrDislike } from "../../Controller/commonFolders/postController/Post";
const postRouter = express.Router();


postRouter
.get('/:id',errorCatch(getpostbyid))
.get("/owner/:ownerId",userAuthMiddleware,errorCatch( getPostsByOwner))
.post("/upload",upload.fields([{ name: "media", maxCount: 5}]),userAuthMiddleware,errorCatch( addPost))

//comment
.get('/viewcomment/:id',userAuthMiddleware,errorCatch(getCommentById))  
.post("/comment",userAuthMiddleware,errorCatch(addCommentToPost))
.put("/edit-comment",userAuthMiddleware,errorCatch(editComment))
.delete("/delete-comment", userAuthMiddleware,errorCatch(deleteComment))

.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))
.get("/user/findreply/:commentId",userAuthMiddleware,errorCatch(getRepliesForComment))
.put("/user/editreplay",userAuthMiddleware,errorCatch(editReply))
.delete("/user/deletereplay",userAuthMiddleware,errorCatch(deleteReplay))
.post("/user/likepost/:postid",userAuthMiddleware,errorCatch(LikeOrDislike))
.post("/user/reportpost",userAuthMiddleware,errorCatch(ReportPost))
export default postRouter;
 
 