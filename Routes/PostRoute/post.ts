import express from "express";
import { addPost } from "../../Controller/commonFolders/postController/Post";
import { upload } from "../../Middleware/upload";
import {errorCatch} from '../../Middleware/tryCatch'
const postRouter = express.Router();


postRouter
postRouter.post("/post", upload.array("media", 5), errorCatch(addPost));

export default postRouter;
