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
exports.getCommentsWithReplies = exports.deleteReply = exports.editReply = exports.getRepliesForComment = exports.replyToComment = void 0;
const CommentSchema_1 = require("../../model/CommentSchema");
const CommentSchema_2 = require("../../model/CommentSchema");
const PostSchema_1 = require("../../model/PostSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
//reply to a comment
const replyToComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { postId, commentId, replyText } = req.body;
    if (!postId || !commentId || !userId || !replyText) {
        throw new errorHandler_1.CustomError("All fields are required", 400);
    }
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    const comment = yield CommentSchema_1.Comment.findById(commentId);
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    const reply = new CommentSchema_2.Reply({
        user: userId,
        reply: replyText,
        repliedAt: new Date(),
        userModel: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) === 'Company' ? 'Company' : 'User',
    });
    yield reply.save();
    comment.replies.push(reply.id);
    yield reply.save();
    yield comment.save();
    res
        .status(200)
        .json({ success: true, message: "Reply added successfully", reply });
});
exports.replyToComment = replyToComment;
// get all the reply of a perticular comment
const getRepliesForComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    if (!commentId) {
        throw new errorHandler_1.CustomError("Comment ID is required", 400);
    }
    const comment = yield CommentSchema_1.Comment.findById(commentId).populate({
        path: "replies",
        model: CommentSchema_2.Reply,
        populate: {
            path: "user",
        },
    });
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    res.status(200).json({ success: true, replies: comment.replies });
});
exports.getRepliesForComment = getRepliesForComment;
//edit reply
const editReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newReplyText, commentId, replayedId } = req.body;
    if (!commentId || !replayedId || !newReplyText) {
        throw new errorHandler_1.CustomError("Comment ID, Reply ID, and new reply text are required", 400);
    }
    const comment = yield CommentSchema_1.Comment.findById(commentId);
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 404);
    }
    const replyIndex = comment.replies.findIndex((replyId) => replyId.toString() === replayedId);
    if (replyIndex === -1) {
        throw new errorHandler_1.CustomError("Reply not found in the comment", 404);
    }
    const reply = yield CommentSchema_2.Reply.findById(replayedId);
    if (!reply) {
        throw new errorHandler_1.CustomError("Reply not found", 404);
    }
    reply.reply = newReplyText;
    yield reply.save();
    res
        .status(200)
        .json({
        success: true,
        message: "Reply updated successfully",
        updatedReply: reply,
    });
});
exports.editReply = editReply;
//delete a reply
const deleteReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { commentId, replayId } = req.body;
    if (!commentId) {
        throw new errorHandler_1.CustomError("Comment ID not found", 400);
    }
    if (!replayId) {
        throw new errorHandler_1.CustomError("Reply ID not found", 400);
    }
    const comment = yield CommentSchema_1.Comment.findById(commentId);
    if (!comment) {
        throw new errorHandler_1.CustomError("Comment not found", 401);
    }
    if (!comment.replies.includes(replayId)) {
        throw new errorHandler_1.CustomError("Reply ID not found in replies", 401);
    }
    const reply = yield CommentSchema_2.Reply.findById(replayId);
    if (!reply) {
        throw new errorHandler_1.CustomError("Reply not found", 404);
    }
    if (reply.user.toString() !== userId) {
        throw new errorHandler_1.CustomError("You can only delete your own replies", 403);
    }
    const deletedReply = yield CommentSchema_2.Reply.findByIdAndUpdate(replayId, { isDeleted: true }, { new: true });
    const activeReplies = yield CommentSchema_2.Reply.find({ commentId, isDeleted: false });
    res.status(200).json({
        success: true,
        message: "Reply deleted successfully",
        deletedReply,
        replies: activeReplies,
    });
});
exports.deleteReply = deleteReply;
//get the comments with reply
const getCommentsWithReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield CommentSchema_1.Comment.find({ isDeleted: false })
        .populate({
        path: "replies",
        match: { isDeleted: false },
    })
        .exec();
    if (!comments.length) {
        res.status(404).json({
            success: false,
            message: "No comments found",
        });
        return;
    }
    res
        .status(200)
        .json({ success: true, message: "found it comments", comments });
});
exports.getCommentsWithReplies = getCommentsWithReplies;
