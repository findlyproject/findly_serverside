import express from "express";
import {getpostbyid,getPostsByOwner, ReportPost,addPost,getAllPosts } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../middleware/upload";
import {errorCatch} from '../../middleware/tryCatch'
import { getCommentById,addCommentToPost,editComment,deleteComment,getAllComments} from "../../Controller/commonFolders/postController/Comment";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { deleteReplay, editReply, getRepliesForComment, replyToComment } from "../../Controller/commonFolders/postController/Replay";
import { LikeOrDislike } from "../../Controller/commonFolders/postController/Post";
const postRouter = express.Router();

postRouter

//post
.get("/allposts", getAllPosts)
.get('/post/:id',errorCatch(getpostbyid))
.get("/owner/:ownerId",userAuthMiddleware,errorCatch( getPostsByOwner))
.post(
    "/upload",
    userAuthMiddleware, // ✅ Ensure user authentication happens first
    upload.fields([{ name: "media", maxCount: 5 },]), // ✅ Accept multiple files
    addPost
  )
  

//like & unlike
.post("/user/likepost/:postid",userAuthMiddleware,errorCatch(LikeOrDislike))

//comment
.get("/allcomments",errorCatch(getAllComments))  
.get('/viewcomment/:id',userAuthMiddleware,errorCatch(getCommentById))  
.post("/comment",userAuthMiddleware,errorCatch(addCommentToPost))
.put("/edit-comment/:commentId",userAuthMiddleware,errorCatch(editComment))
.post("/delete-comment/:commentId", userAuthMiddleware,errorCatch(deleteComment))

//reply
.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))
.get("/user/findreply/:commentId",userAuthMiddleware,errorCatch(getRepliesForComment))
.get("/user/editreplay",userAuthMiddleware,errorCatch(editReply))
.delete("/user/deletereplay",userAuthMiddleware,errorCatch(deleteReplay))

//report
.post("/user/reportpost",userAuthMiddleware,errorCatch(ReportPost))

export default postRouter;
 
