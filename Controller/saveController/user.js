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
exports.AllSaved = exports.SaveandUnsavePost = void 0;
const PostSchema_1 = require("../../model/PostSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const SaveSchema_1 = require("../../model/SaveSchema");
const SaveandUnsavePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const postId = req.params.id;
    const post = yield PostSchema_1.Post.findById(postId);
    if (!post) {
        throw new errorHandler_1.CustomError("post not found", 404);
    }
    const existingSave = yield SaveSchema_1.Save.findOne({ userId, postId });
    if (existingSave) {
        yield SaveSchema_1.Save.findByIdAndDelete(existingSave._id);
        res.status(200).json({ status: true, message: "Post unsaved" });
        return;
    }
    else {
        const saved = new SaveSchema_1.Save({ userId, postId });
        yield saved.save();
        res.status(200).json({ status: true, message: "Post saved", saved });
        return;
    }
});
exports.SaveandUnsavePost = SaveandUnsavePost;
const AllSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const saved = yield SaveSchema_1.Save.find({ userId: userid }).populate({
        path: 'postId',
        populate: {
            path: 'owner', // Populate the 'owner' field inside 'postId'
        },
    });
    res.status(200).json({ status: true, message: 'saveds', saved });
});
exports.AllSaved = AllSaved;
// export const All=async(req:Request,res:Response):Promise<void>=>{
//     const userid=req.user?.id
//     const saved=await Save.find({userId:userid})
//     res.status(200).json({ status:true,message:'saveds',saved})
// }
