"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Community = exports.CommunityMessage = exports.Message = exports.Conversation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
//community
const CommunitySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    profile: {
        type: String,
    },
    members: [
        {
            memberId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                refPath: "memberModel",
            },
            memberModel: {
                type: String,
                enum: ["User", "Company"],
            },
        },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const CommunityMessageSchema = new mongoose_1.Schema({
    communityId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        refPath: "senderModel",
    },
    senderModel: {
        type: String,
        required: true,
        enum: ["User", "Company"],
    },
    message: {
        type: String,
        required: true,
    },
    isDelete: { type: Boolean, default: false },
    type: {
        type: String,
        required: true,
        enum: ["text", "image", "video", "file"],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
//message
const MessageSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String },
    seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const ConversationSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Message" }],
    lastUpdated: { type: Date, default: Date.now },
    isStarredUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }], // users who starred this conversation
    isBlockedUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
});
exports.Conversation = mongoose_1.default.model("Conversation", ConversationSchema);
exports.Message = mongoose_1.default.model("Message", MessageSchema);
exports.CommunityMessage = mongoose_1.default.model("CommunityMessage", CommunityMessageSchema);
exports.Community = mongoose_1.default.model("Community", CommunitySchema);
