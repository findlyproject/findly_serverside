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
exports.getPostsByOwner = void 0;
const PostSchema_1 = require("../../model/PostSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const getPostsByOwner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const posts = yield PostSchema_1.Post.find({ owner: ownerId }).populate({ path: "owner", match: { type: "Company" } });
    if (!posts) {
        throw new errorHandler_1.CustomError("you doesn't have any post", 404);
    }
    console.log("posts", posts);
    res
        .status(200)
        .json({ status: true, message: "Got the posts by the owner", posts });
    return;
});
exports.getPostsByOwner = getPostsByOwner;
