import express from "express";
import {getpostbyid,getPostsByOwner } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'
// import { replyToPost } from "../../Controller/commonFolders/postController/Replay";
import { getCommentById,addCommentToPost,editComment,deleteComment} from "../../Controller/commonFolders/postController/Comment";

import { userAuthMiddleware } from "../../Middleware/userauthantication";
import { deleteReplay, editReply, getRepliesForComment, replyToComment } from "../../Controller/commonFolders/postController/Replay";
const postRouter = express.Router();


postRouter
// .post("/post",upload.array("media", 5),errorCatch(addPost));
// .post("/user/postreplay/:postId",userAuthMiddleware,errorCatch(replyToPost))
.get('/:id',errorCatch(getpostbyid))
.get("/owner/:ownerId",userAuthMiddleware,errorCatch( getPostsByOwner))

//comment
.get('/viewcomment/:id',userAuthMiddleware,errorCatch(getCommentById))  
.post("/comment",userAuthMiddleware,errorCatch(addCommentToPost))
.put("/edit-comment",userAuthMiddleware,errorCatch(editComment))
.delete("/delete-comment", userAuthMiddleware,errorCatch(deleteComment))

.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))
.get("/user/findreply/:commentId",userAuthMiddleware,errorCatch(getRepliesForComment))
.get("/user/editreplay",userAuthMiddleware,errorCatch(editReply))
.delete("/user/deletereplay",userAuthMiddleware,errorCatch(deleteReplay))

export default postRouter;
 
