"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../Controller/postController/user");
const upload_1 = require("../middleware/upload");
const tryCatch_1 = require("../middleware/tryCatch");
const userauthantication_1 = require("../middleware/userauthantication");
const user_2 = require("../Controller/reportController/user");
const postRouter = express_1.default.Router();
postRouter
    //post
    .get("/allposts", (0, tryCatch_1.errorCatch)(user_1.getAllPosts))
    .get("/post/:id", (0, tryCatch_1.errorCatch)(user_1.getpostbyid))
    .get("/owner", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_1.getPostsByOwners))
    .post("/upload", userauthantication_1.userAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), user_1.addPost)
    .patch("/update/:postId", userauthantication_1.userAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), (0, tryCatch_1.errorCatch)(user_1.updatePost))
    .put("/delete/:postId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_1.DeletePost))
    //report
    .post("/user/reportpost", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_2.ReportPost))
    .post("/company/reportpost", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_2.ReportPost));
exports.default = postRouter;
