import express from "express";
// import { addPost } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'

import { userAuthMiddleware } from "../../Middleware/userauthantication";
import { replyToComment } from "../../Controller/commonFolders/postController/Replay";
const postRouter = express.Router();


postRouter
// .post("/post",upload.array("media", 5),errorCatch(addPost));
.post("/user/postreplay",userAuthMiddleware,errorCatch(replyToComment))

export default postRouter;
 