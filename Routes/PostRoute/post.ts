import express from "express";
import {getpostbyid,getPostsByOwner, ReportPost,addPost,getAllPosts } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../middleware/upload";
import {errorCatch} from '../../middleware/tryCatch'
import { getCommentById,addCommentToPost,editComment,deleteComment,getAllComments} from "../../Controller/commonFolders/postController/Comment";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import {  deleteReply, editReply, getCommentsWithReplies, getRepliesForComment, replyToComment } from "../../Controller/commonFolders/postController/Replay";
import { LikeOrDislike } from "../../Controller/commonFolders/postController/Post";
import { validateData } from "../../middleware/zodValidation";
import { IdSchema } from "../../Utils/zodSchema";
const postRouter = express.Router();

postRouter    

//post
.get("/allposts", getAllPosts)
.get('/post/:id',validateData(IdSchema),errorCatch(getpostbyid))
.get("/owner/:ownerId",userAuthMiddleware,validateData(IdSchema),errorCatch( getPostsByOwner))
.post(
    "/upload",
    userAuthMiddleware, // ✅ Ensure user authentication happens first
    upload.fields([{ name: "media", maxCount: 5 },]), // ✅ Accept multiple files
    addPost
  )
                             

//like & unlike
.post("/user/likepost/:postid",userAuthMiddleware,validateData(IdSchema),errorCatch(LikeOrDislike))
           
//comment
.get("/allcomments",errorCatch(getAllComments))  
.get('/viewcomment/:id',userAuthMiddleware,validateData(IdSchema),errorCatch(getCommentById))  
.post("/comment",userAuthMiddleware,errorCatch(addCommentToPost))
.put("/edit-comment/:commentId",userAuthMiddleware,errorCatch(editComment))
.post("/delete-comment/:commentId", userAuthMiddleware,validateData(IdSchema),errorCatch(deleteComment))

//reply
.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))
.get("/user/findreply/:commentId",userAuthMiddleware,errorCatch(getRepliesForComment))
.put("/user/editreplay",userAuthMiddleware,errorCatch(editReply))
.delete("/user/deletereplay",userAuthMiddleware,errorCatch(deleteReply))
.get("/user/getcommentswithreplies",userAuthMiddleware,errorCatch(getCommentsWithReplies))

//report
.post("/user/reportpost",userAuthMiddleware,errorCatch(ReportPost)) 

export default postRouter;
 
 