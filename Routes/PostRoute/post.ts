import express from "express";
import {getpostbyid,getPostsByOwner } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'
// import { replyToPost } from "../../Controller/commonFolders/postController/Replay";
import { getCommentById,addCommentToPost,editComment,deleteComment} from "../../Controller/commonFolders/postController/Comment";

import { userAuthMiddleware } from "../../Middleware/userauthantication";
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

export default postRouter;

