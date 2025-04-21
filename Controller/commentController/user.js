"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentById = exports.deleteComment = exports.editComment = exports.addCommentToPost = exports.getAllComments = void 0;
const PostSchema_1 = require("../../model/PostSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const CommentSchema_1 = require("../../model/CommentSchema");
// Get all comments
const getAllComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield CommentSchema_1.Comment.find().populate("user");
    const totalComments = yield CommentSchema_1.Comment.countDocuments();
    res.status(200).json({
        status: true,
        message: "Got all the comments",
        comments,
        totalComments,
    });
});
exports.getAllComments = getAllComments;
// Comment on a Post
const addCommentToPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { postId, comment } = req.body;
    console.log(req.body);
    if (!comment || comment.trim() === "") {
        throw new errorHandler_1.CustomError("Comment cannot be empty", 400);
    }
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    const newComment = new CommentSchema_1.Comment({
        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        comment,
        userModel: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) === 'Company' ? 'Company' : 'User',
    });
    yield newComment.save();
    if (!post.comments) {
        post.comments = [];
    }
    post.comments.push(newComment.id);
    yield post.save();
    const populatedComment = yield CommentSchema_1.Comment.findById(newComment._id)
        .populate("user")
        .exec();
    res.status(201).json({
        status: true,
        message: "Comment added successfully",
        comment: populatedComment,
    });
});
exports.addCommentToPost = addCommentToPost;
// update a comment by id
const editComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { newComment } = req.body;
    const { commentId } = req.params;
    if (!newComment || newComment.trim() === "") {
        throw new errorHandler_1.CustomError("Comment cannot be empty", 400);
    }
    const comment = yield CommentSchema_1.Comment.findById(commentId).populate("user");
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    if (comment.user._id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new errorHandler_1.CustomError("Unauthorized: You can only edit your own comments", 403);
    }
    comment.comment = newComment;
    yield comment.save();
    res.status(200).json({
        status: true,
        message: "Comment updated successfully",
        comment,
    });
    return;
});
exports.editComment = editComment;
// Delete a Comment
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const comment = yield CommentSchema_1.Comment.findById(commentId);
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    if (comment.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new errorHandler_1.CustomError("Unauthorized: You can only delete your own comments", 403);
    }
    comment.isDeleted = true;
    yield comment.save();
    res.status(200).json({
        status: true,
        message: "Comment marked as deleted successfully",
        comment,
    });
});
exports.deleteComment = deleteComment;
// get a comment by ID
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.params.id", req.params.id);
    const comment = yield CommentSchema_1.Comment.findById(req.params.id).populate("user");
    console.log(comment);
    if (!comment) {
        throw new errorHandler_1.CustomError("No post found containing this comment", 404);
    }
    const commented = comment.comment;
    if (!commented) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    res.status(200).json({ status: true, message: "Comment found", comment });
    return;
});
exports.getCommentById = getCommentById;
