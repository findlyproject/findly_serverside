import express from "express";
// import { addPost } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'
import { replyToPost } from "../../Controller/commonFolders/postController/Replay";
import { userAuthMiddleware } from "../../Middleware/userauthantication";
const postRouter = express.Router();


postRouter
// .post("/post",upload.array("media", 5),errorCatch(addPost));
.post("/user/postreplay/:postId",userAuthMiddleware,errorCatch(replyToPost))

export default postRouter;
