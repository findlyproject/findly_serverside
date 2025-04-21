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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePost = exports.deleteApplicatio = exports.getSavedApplicationById = exports.saveOrUnsaveApplication = exports.getLikedPosts = exports.LikeOrDislike = exports.getpostbyid = exports.getPostsByOwners = exports.updatePost = exports.addPost = exports.getAllPosts = void 0;
const PostSchema_1 = require("../../model/PostSchema");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const errorHandler_1 = require("../../Utils/errorHandler");
const AppliactionSaveSchema_1 = require("../../model/AppliactionSaveSchema");
const JobApplicationSchema_1 = require("../../model/JobApplicationSchema");
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 5 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const posts = yield PostSchema_1.Post.find({ isDeleted: false })
            .populate("owner")
            .populate("reports")
            .populate("likedBy", "firstName lastName profileImage")
            .populate({
            path: "comments",
            match: { isDeleted: false },
            populate: { path: "user" },
        })
            .sort({ createdAt: -1 }) // Sort by newest
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalPosts = yield PostSchema_1.Post.countDocuments({ isDeleted: false });
        res.status(200).json({
            status: true,
            message: "Got paginated posts",
            posts,
            totalPosts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalPosts / limitNumber),
        });
    }
    catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});
exports.getAllPosts = getAllPosts;
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { description } = req.body;
    if (!description || !((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new errorHandler_1.CustomError("Description and owner are required", 400);
    }
    if (!req.files) {
        throw new errorHandler_1.CustomError("No media uploaded", 400);
    }
    console.log("req.files", req.files);
    const uploadedImages = [];
    let uploadedVideo = null;
    if ("media" in req.files) {
        const mediaFiles = req.files["media"];
        for (const file of mediaFiles) {
            const result = yield cloudinary_1.v2.uploader.upload(file.path, {
                resource_type: "auto",
                folder: "posts/media",
            });
            if (file.mimetype.startsWith("image/")) {
                uploadedImages.push(result.secure_url);
            }
            else if (file.mimetype.startsWith("video/")) {
                uploadedVideo = result.secure_url;
            }
        }
    }
    const newPost = new PostSchema_1.Post({
        description,
        owner: req.user.id,
        ownerModel: req.user.type === 'Company' ? 'Company' : 'User',
        images: uploadedImages,
        video: uploadedVideo,
    });
    yield newPost.save();
    const populatedPost = yield PostSchema_1.Post.findById(newPost._id)
        .populate("owner") // Adjust fields based on your schema
        .exec();
    res.status(201).json({
        status: true,
        message: "Post uploaded successfully",
        post: populatedPost,
    });
});
exports.addPost = addPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.params;
    const { description } = req.body;
    if (!postId) {
        throw new errorHandler_1.CustomError("Post ID is required", 400);
    }
    const post = yield PostSchema_1.Post.findById(postId).populate("owner");
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    // Check if the user is the owner of the post
    if (post.owner._id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new errorHandler_1.CustomError("Unauthorized to update this post", 403);
    }
    // Handle new media uploads
    let uploadedImages = post.images || [];
    let uploadedVideo = post.video || "";
    if (req.files && "media" in req.files) {
        const mediaFiles = req.files["media"];
        // Delete existing media from Cloudinary if new files are uploaded
        if (uploadedImages.length > 0 || uploadedVideo) {
            for (const img of uploadedImages) {
                yield cloudinary_1.v2.uploader.destroy(img);
            }
            if (uploadedVideo) {
                yield cloudinary_1.v2.uploader.destroy(uploadedVideo);
            }
        }
        uploadedImages = [];
        uploadedVideo = "";
        for (const file of mediaFiles) {
            const result = yield cloudinary_1.v2.uploader.upload(file.path, {
                resource_type: "auto",
                folder: "posts/media",
            });
            if (file.mimetype.startsWith("image/")) {
                uploadedImages.push(result.secure_url);
            }
            else if (file.mimetype.startsWith("video/")) {
                uploadedVideo = result.secure_url;
            }
        }
    }
    // Update post details
    post.description = description || post.description;
    post.images = uploadedImages;
    post.video = uploadedVideo;
    yield post.save();
    res.status(200).json({
        status: true,
        message: "Post updated successfully",
        post,
    });
});
exports.updatePost = updatePost;
//  Get Posts by user
const getPostsByOwners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const posts = yield PostSchema_1.Post.find({ owner: ownerId }).populate('owner');
    if (!posts || posts.length === 0) {
        throw new errorHandler_1.CustomError("No posts found for this owner", 404);
    }
    res
        .status(200)
        .json({ status: true, message: "Got the posts by the owner", posts });
    return;
});
exports.getPostsByOwners = getPostsByOwners;
//get post by id
const getpostbyid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const onepost = yield PostSchema_1.Post.findById(req.params.id).populate("comments owner reports");
    console.log("onepost", onepost);
    res.status(200).json({ status: true, message: "Got post by ID", onepost });
});
exports.getpostbyid = getpostbyid;
//like or dislike
const LikeOrDislike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const postId = req.params.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized: User ID missing", 401);
    }
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const likedIndex = post.likedBy.findIndex((id) => id.equals(userObjectId));
    if (likedIndex === -1) {
        post.likedBy.push(userObjectId);
        yield post.save();
        res
            .status(200)
            .json({ status: true, message: "Post liked successfully", post });
    }
    else {
        post.likedBy.splice(likedIndex, 1);
        yield post.save();
        res
            .status(200)
            .json({ status: true, message: "Post disliked successfully", post });
    }
});
exports.LikeOrDislike = LikeOrDislike;
const getLikedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized: User ID missing", 401);
    }
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    // Find posts where the likedBy array contains the user's ID
    const likedPosts = yield PostSchema_1.Post.find({ likedBy: userObjectId }).populate('owner');
    res.status(200).json({
        status: true,
        message: "Liked posts retrieved successfully",
        likedPosts,
    });
});
exports.getLikedPosts = getLikedPosts;
const saveOrUnsaveApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { applicationId } = req.body;
    if (!applicationId) {
        res.status(400).json({ message: "companyId and applicationId are required" });
        return;
    }
    const jobApplication = yield JobApplicationSchema_1.JobApplication.findById(applicationId);
    if (!jobApplication) {
        res.status(404).json({ message: "Job application not found" });
        return;
    }
    jobApplication.isSaved = !jobApplication.isSaved;
    yield jobApplication.save();
    const existingApplication = yield AppliactionSaveSchema_1.ApplicationSave.findOne({ companyId, applicationId });
    if (existingApplication) {
        yield AppliactionSaveSchema_1.ApplicationSave.findByIdAndDelete(existingApplication._id);
        res.status(200).json({ message: "Application unsaved successfully" });
    }
    else {
        const newApplicationSave = new AppliactionSaveSchema_1.ApplicationSave({ companyId, applicationId });
        yield newApplicationSave.save();
        res.status(201).json({ message: "Application saved successfully", data: newApplicationSave });
    }
});
exports.saveOrUnsaveApplication = saveOrUnsaveApplication;
const getSavedApplicationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const application = yield AppliactionSaveSchema_1.ApplicationSave.find({ companyId: companyId }).populate("companyId applicationId");
    if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
    }
    res.status(200).json({ success: true, message: "find all messages", application });
});
exports.getSavedApplicationById = getSavedApplicationById;
const deleteApplicatio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const companyId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { applicationId } = req.body;
    const application = yield JobApplicationSchema_1.JobApplication.findOne({ companyId: companyId, _id: applicationId });
    if (!application) {
        res.status(404).json({ success: false, message: "application not found" });
        return;
    }
    application.isCompanyDelete = true;
    yield application.save();
    res.status(200).json({ message: "Application deleted successfully" });
});
exports.deleteApplicatio = deleteApplicatio;
// delete 
const DeletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.params;
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("Post not found", 404);
    }
    if (post.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new errorHandler_1.CustomError("Unauthorized: You can only delete your own posts", 403);
    }
    post.isDeleted = true; // Soft delete
    yield post.save();
    res.status(200).json({
        success: true,
        message: "Post marked as deleted successfully",
        post,
    });
});
exports.DeletePost = DeletePost;
