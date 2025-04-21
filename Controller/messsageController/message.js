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
exports.DeleteConversation = exports.ClearChat = exports.getStarredUsers = exports.StarOrRemoveStar = exports.GetChatList = exports.BlockOrUnblockUser = exports.Conversations = exports.GetConversation = exports.SendMessage = exports.SearchCommunity = exports.DeleteCommunity = exports.ProfileOfCommunity = exports.UpdateNameCommunity = exports.UpdateDescriptionCommunity = exports.CommunityDetails = exports.LeaveCommunity = exports.deletecommunitymessage = exports.communitymesgById = exports.CommunitySendMessage = exports.joinCommunity = exports.AllCommunities = exports.createCommunity = void 0;
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const MessageSchema_1 = require("../../model/MessageSchema");
const errorHandler_1 = require("../../Utils/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const CompanySchema_1 = require("../../model/CompanySchema");
//community
const createCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log("userId", userId);
    const { name, description, profile } = req.body;
    console.log("{name,description,profile}", { name, description, profile });
    if (!userId) {
        throw new errorHandler_1.CustomError("current company not found", 404);
    }
    if (!name || !description) {
        throw new errorHandler_1.CustomError("name and description is required", 400);
    }
    const existingCommunity = yield MessageSchema_1.Community.findOne({ name });
    if (existingCommunity) {
        throw new errorHandler_1.CustomError("community already exists", 400);
    }
    const community = new MessageSchema_1.Community({
        name,
        description,
        createdBy: userId,
        profile,
        members: [
            {
                memberId: userId,
                memberModel: "Company",
            },
        ],
    });
    yield community.save();
    res
        .status(201)
        .json({ status: true, message: "community created", community });
});
exports.createCommunity = createCommunity;
const AllCommunities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const communities = yield MessageSchema_1.Community.find({ isDeleted: false }).populate({
        path: "members.memberId",
        select: "_id firstName lastName profileImage logo name",
    });
    if (!communities) {
        throw new errorHandler_1.CustomError("all communities not found", 404);
    }
    res.status(200).json({ status: true, message: "communities", communities });
});
exports.AllCommunities = AllCommunities;
const joinCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const io = res.app.get("io");
    const communityId = req.params.id;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const community = yield MessageSchema_1.Community.findById(communityId).populate("members");
    if (!community) {
        res.status(404).json({ status: false, message: "Community not found" });
        return;
    }
    const isMember = community.members.some((member) => member.memberId.toString() === userId);
    if (isMember) {
        res
            .status(400)
            .json({ status: false, message: "User is already a member" });
        return;
    }
    community.members.push({
        memberId: new mongoose_1.default.Types.ObjectId(userId),
        memberModel: "User",
    });
    yield community.save();
    const savedCommunity = yield MessageSchema_1.Community.findById(communityId).populate("members");
    console.log("response join", savedCommunity);
    io.emit("communtjoin", savedCommunity);
    res
        .status(200)
        .json({
        status: true,
        message: "User joined the community successfully",
        savedCommunity,
    });
});
exports.joinCommunity = joinCommunity;
const CommunitySendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const io = res.app.get("io");
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const communityId = req.params.id;
    const { message, type } = req.body;
    console.log("object", message, type);
    const [user, company] = yield Promise.all([
        UserSchema_1.default.findOne({ _id: userId }),
        CompanySchema_1.Company.findOne({ _id: userId }),
    ]);
    const currentUser = user || company;
    const senderModel = user ? "User" : "Company";
    console.log("currentUser....", currentUser);
    if (!currentUser) {
        throw new errorHandler_1.CustomError("user not found", 404);
    }
    const findCommunity = yield MessageSchema_1.Community.findOne({ _id: communityId });
    if (!findCommunity) {
        res
            .status(404)
            .json({ status: false, message: "community Id is not found" });
        return;
    }
    if (!message) {
        res.status(404).json({ status: false, message: "message not found" });
        return;
    }
    const newMessage = yield new MessageSchema_1.CommunityMessage({
        communityId,
        sender: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id,
        senderModel,
        message,
        type,
    });
    const savecommunitymessage = yield newMessage.save();
    io.emit("sendedMessage", savecommunitymessage);
    res
        .status(200)
        .json({
        status: true,
        message: "messsag send successfully",
        data: savecommunitymessage,
    });
});
exports.CommunitySendMessage = CommunitySendMessage;
const communitymesgById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const communityId = req.params.id;
    const findCommunity = yield MessageSchema_1.Community.findOne({ _id: communityId });
    if (!findCommunity) {
        res.status(404).json({ status: false, message: "community is not found" });
        return;
    }
    const findCommunityMessaeg = yield MessageSchema_1.CommunityMessage.find({
        communityId,
        isDelete: false,
    }).populate({
        path: "sender",
        select: "_id firstName profileImage logo name",
    });
    // .populate({ path: "sender", select: "_id logo name" })
    console.log("findCommunityMessaeg", findCommunityMessaeg);
    res
        .status(200)
        .json({
        status: true,
        message: "get community by id",
        Message: findCommunityMessaeg,
    });
});
exports.communitymesgById = communitymesgById;
const deletecommunitymessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const io = res.app.get("io");
    const messageId = req.params.id;
    if (!messageId) {
        res.status(404).json({ status: false, message: "message id is not found" });
        return;
    }
    const findMessage = yield MessageSchema_1.CommunityMessage.findOne({ _id: messageId });
    if (!findMessage) {
        res.status(404).json({ status: false, message: "message id wrong" });
        return;
    }
    findMessage.isDelete = true;
    findMessage.save();
    const findecommunitymessage = yield MessageSchema_1.CommunityMessage.find({
        communityId: findMessage.communityId,
        isDelete: false,
    });
    console.log("findMessage", findecommunitymessage);
    io.emit("undeletedMessages", findMessage);
    res.status(200).json({ status: true, message: "delete successfully" });
});
exports.deletecommunitymessage = deletecommunitymessage;
//leave community
const LeaveCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const communityid = req.params.id;
    const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log("userid for community", userid);
    const community = yield MessageSchema_1.Community.findById(communityid);
    if (!community) {
        throw new errorHandler_1.CustomError(`community not found`, 404);
    }
    const isMember = community.members.some((member) => member.toString() === userid);
    if (!isMember) {
        throw new errorHandler_1.CustomError("user is not a member", 400);
    }
    community.members = community.members.filter((item) => item.toString() !== userid);
    yield community.save();
    res.status(200).json({ status: true, message: "leave community", community });
});
exports.LeaveCommunity = LeaveCommunity;
//Community Details
const CommunityDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const communityID = req.params.id;
    let community = yield MessageSchema_1.Community.findById(communityID)
        .populate({
        path: "createdBy",
        select: "_id name logo",
    })
        .lean();
    if (!community) {
        throw new errorHandler_1.CustomError(`Community not found`, 404);
    }
    if (community.members && community.members.length > 0) {
        community.members = yield Promise.all(community.members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
            if (member.memberModel === "User") {
                member.memberId = yield UserSchema_1.default.findById(member.memberId).select("profileImage firstName lastName _id name logo");
            }
            else if (member.memberModel === "Company") {
                member.memberId = yield CompanySchema_1.Company.findById(member.memberId).select("_id name logo");
            }
            return member;
        })));
    }
    console.log("community..............", community);
    res
        .status(200)
        .json({ status: true, message: "Community details", community });
});
exports.CommunityDetails = CommunityDetails;
//UpdateCommunity
const UpdateDescriptionCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const communityid = req.params.id;
    const { description } = req.body;
    const creatorID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!description) {
        throw new errorHandler_1.CustomError(" description is required", 400);
    }
    const community = yield MessageSchema_1.Community.findById(communityid);
    if (!community) {
        throw new errorHandler_1.CustomError("community not found", 404);
    }
    if (community.createdBy.toString() !== creatorID) {
        throw new errorHandler_1.CustomError("Unauthorized! Only the  admin can update this community.", 400);
    }
    community.description = description;
    yield community.save();
    res
        .status(200)
        .json({ status: true, message: "updated successfully", community });
});
exports.UpdateDescriptionCommunity = UpdateDescriptionCommunity;
const UpdateNameCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const communityid = req.params.id;
    const { name } = req.body;
    const creatorID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!name) {
        throw new errorHandler_1.CustomError(" name is required", 400);
    }
    const community = yield MessageSchema_1.Community.findById(communityid);
    if (!community) {
        throw new errorHandler_1.CustomError("community not found", 404);
    }
    if (community.createdBy.toString() !== creatorID) {
        throw new errorHandler_1.CustomError("Unauthorized! Only the  admin can update this community.", 400);
    }
    community.name = name;
    yield community.save();
    res
        .status(200)
        .json({ status: true, message: "updated successfully", community });
});
exports.UpdateNameCommunity = UpdateNameCommunity;
const ProfileOfCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const communityid = req.params.id;
    const creatorID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const community = yield MessageSchema_1.Community.findById(communityid);
    if (!community) {
        throw new errorHandler_1.CustomError("community not found", 404);
    }
    if (community.createdBy.toString() !== creatorID) {
        throw new errorHandler_1.CustomError("Unauthorized! Only the  admin can update this community.", 400);
    }
    if (req.file) {
        community.profile = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
    }
    console.log("req.file", req.file);
    yield community.save();
    res
        .status(200)
        .json({ status: true, message: "updated successfully", community });
});
exports.ProfileOfCommunity = ProfileOfCommunity;
//admin can Delete Community
const DeleteCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const communityid = req.params.id;
    const community = yield MessageSchema_1.Community.findById(communityid);
    const creatorID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!community) {
        throw new errorHandler_1.CustomError(`community not found`, 404);
    }
    if (community.createdBy.toString() !== creatorID) {
        throw new errorHandler_1.CustomError("Unauthorized! Only the  admin can delete this community.", 400);
    }
    community.isDeleted = true;
    yield community.save();
    res
        .status(200)
        .json({ status: true, message: "community deleted", community });
});
exports.DeleteCommunity = DeleteCommunity;
//search community
const SearchCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("dfghjsdfgh");
    const { query } = req.query;
    console.log("query", query);
    if (!query) {
        throw new errorHandler_1.CustomError(`query is required`, 400);
    }
    const community = yield MessageSchema_1.Community.find({
        name: { $regex: query, $options: "i" },
    }).populate("members");
    if (!community) {
        throw new errorHandler_1.CustomError(`community not found`, 404);
    }
    res.status(200).json({ status: true, message: "success", community });
});
exports.SearchCommunity = SearchCommunity;
//message
const SendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const io = req.app.get("io");
    const { senderId, receiverId } = req.params;
    const { message } = req.body;
    console.log(message);
    const sender = yield UserSchema_1.default.findById(senderId);
    const receiver = yield UserSchema_1.default.findById(receiverId);
    if (!sender || !receiver) {
        res.status(404).json({ message: "Sender or receiver not found" });
        return;
    }
    io.on("newMessage", (data) => {
        console.log("message", data);
    });
    let conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    console.log("conversation", conversation);
    if (conversation && conversation.isBlockedUsers.length > 0) {
        res
            .status(403)
            .json({
            message: "You cannot send messages in this conversation. Blocked.",
        });
        return;
    }
    const newMessage = new MessageSchema_1.Message({
        sender: senderId,
        receiver: receiverId,
        seen: false,
        message,
    });
    yield newMessage.save();
    if (!conversation) {
        conversation = new MessageSchema_1.Conversation({
            participants: [senderId, receiverId],
            messages: [newMessage._id],
            lastUpdated: new Date(),
        });
    }
    else {
        conversation.messages.push(newMessage._id);
        conversation.lastUpdated = new Date();
    }
    yield conversation.save();
    io.emit("receiveMessage", {
        message: newMessage,
        from: senderId,
    });
    res.status(201).json({ message: "Message sent successfully", newMessage });
});
exports.SendMessage = SendMessage;
const GetConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const activeUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { senderId, receiverId } = req.params;
    if (activeUserId !== senderId && activeUserId !== receiverId) {
        res.status(403).json({ message: "Unauthorized to view this conversation" });
        return;
    }
    const conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    }).populate({
        path: "messages",
        model: "Message",
        match: { isDeleted: false },
        options: { sort: { createdAt: 1 } },
    });
    if (!conversation) {
        res.status(404).json({ message: "No conversation found" });
        return;
    }
    const otherUserId = activeUserId === senderId ? receiverId : senderId;
    yield MessageSchema_1.Message.updateMany({
        sender: otherUserId,
        receiver: activeUserId,
        seen: false,
    }, { $set: { seen: true } });
    res.status(200).json({ messages: conversation.messages });
});
exports.GetConversation = GetConversation;
const Conversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.params;
    const conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
        throw new errorHandler_1.CustomError("conversation not found", 404);
    }
    res
        .status(200)
        .json({
        status: true,
        message: "conversation of active user",
        conversation,
    });
});
exports.Conversations = Conversations;
const BlockOrUnblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.params;
    const { action } = req.body;
    if (!senderId || !receiverId) {
        res.status(400).json({ message: "Sender and Receiver IDs are required" });
        return;
    }
    const conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
        res
            .status(404)
            .json({ message: "No conversation found between these users." });
        return;
    }
    if (action === "block") {
        if (conversation.isBlockedUsers.includes(new mongoose_1.default.Types.ObjectId(senderId))) {
            res.status(400).json({ message: "User already blocked." });
            return;
        }
        conversation.isBlockedUsers.push(new mongoose_1.default.Types.ObjectId(senderId));
        yield conversation.save();
        res.status(200).json({ message: `You have blocked user ${receiverId}.` });
    }
    else if (action === "unblock") {
        if (!conversation.isBlockedUsers.includes(new mongoose_1.default.Types.ObjectId(senderId))) {
            res.status(400).json({ message: "User is not blocked." });
            return;
        }
        conversation.isBlockedUsers = conversation.isBlockedUsers.filter((userId) => userId.toString() !== senderId);
        yield conversation.save();
        res.status(200).json({ message: `You have unblocked user ${receiverId}.` });
    }
    else {
        res
            .status(400)
            .json({ message: "Invalid action. Use 'block' or 'unblock'." });
    }
});
exports.BlockOrUnblockUser = BlockOrUnblockUser;
const GetChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const activeUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!activeUserId) {
            res.status(400).json({ message: "Active user ID is required." });
            return;
        }
        const conversations = yield MessageSchema_1.Conversation.find({
            participants: activeUserId,
        });
        if (!conversations.length) {
            res.status(200).json({ message: "No chats found.", chats: [] });
            return;
        }
        const userIdsSet = new Set();
        conversations.forEach((conv) => {
            conv.participants.forEach((participant) => {
                if (participant.toString() !== activeUserId) {
                    userIdsSet.add(participant.toString());
                }
            });
        });
        const userIds = Array.from(userIdsSet);
        const users = yield UserSchema_1.default.find({ _id: { $in: userIds } }).select("_id profileImage firstName lastName");
        const chatListWithDetails = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const lastMessage = yield MessageSchema_1.Message.findOne({
                $or: [
                    { sender: activeUserId, receiver: user._id },
                    { sender: user._id, receiver: activeUserId },
                ],
                isDeleted: false,
            })
                .sort({ timestamp: -1 })
                .limit(1)
                .lean();
            const unreadCount = yield MessageSchema_1.Message.countDocuments({
                sender: user._id,
                receiver: activeUserId,
                seen: false,
                isDeleted: false,
            });
            return {
                user: {
                    _id: user._id,
                    profileImage: user.profileImage,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                lastMessage: {
                    message: lastMessage ? lastMessage.message : null,
                    timestamp: lastMessage ? lastMessage.timestamp : null,
                    sender: lastMessage ? lastMessage.sender : null,
                    receiver: lastMessage ? lastMessage.receiver : null,
                    seen: lastMessage ? lastMessage.seen : null,
                },
                unreadCount,
            };
        })));
        res.status(200).json({
            message: "Chat list fetched successfully.",
            chats: chatListWithDetails,
        });
    }
    catch (error) {
        console.error("Error fetching chat list:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.GetChatList = GetChatList;
const StarOrRemoveStar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.params;
    const { action } = req.body;
    if (!senderId || !receiverId) {
        res.status(400).json({ message: "Sender and Receiver IDs are required" });
        return;
    }
    const conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
        res
            .status(404)
            .json({ message: "No conversation found between these users." });
        return;
    }
    if (action === "star") {
        if (conversation.isStarredUsers.includes(new mongoose_1.default.Types.ObjectId(receiverId))) {
            res.status(400).json({ message: "User already starred." });
            return;
        }
        conversation.isStarredUsers.push(new mongoose_1.default.Types.ObjectId(receiverId));
        yield conversation.save();
        res.status(200).json({ message: `You have starred user ${receiverId}.` });
    }
    else if (action === "removestar") {
        if (!conversation.isStarredUsers.includes(new mongoose_1.default.Types.ObjectId(receiverId))) {
            res.status(400).json({ message: "User is not stared." });
            return;
        }
        conversation.isStarredUsers = conversation.isStarredUsers.filter((userId) => userId.toString() !== receiverId);
        yield conversation.save();
        res
            .status(200)
            .json({ message: `You have remove star user ${receiverId}.` });
    }
    else {
        res
            .status(400)
            .json({ message: "Invalid action. Use 'star' or 'remove star'." });
    }
});
exports.StarOrRemoveStar = StarOrRemoveStar;
const getStarredUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!senderId) {
            res.status(400).json({ message: "Sender ID is required." });
            return;
        }
        const conversations = yield MessageSchema_1.Conversation.find({
            participants: { $in: [senderId] },
        }).populate("isStarredUsers", "firstName  profileImage jobTitle");
        console.log("conversationsconversations", conversations);
        if (!conversations || conversations.length === 0) {
            res
                .status(404)
                .json({ message: "No conversations found for this user." });
            return;
        }
        const starredUsers = conversations
            .map((conversation) => conversation.isStarredUsers)
            .flat();
        res.status(200).json({
            message: "Starred users fetched successfully.",
            starredUsers,
        });
    }
    catch (error) {
        console.error("Error fetching starred users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getStarredUsers = getStarredUsers;
const ClearChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.params;
    const conversation = yield MessageSchema_1.Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
        throw new errorHandler_1.CustomError("conversation not found ", 404);
    }
    if (conversation.messages.length > 0) {
        yield MessageSchema_1.Message.updateMany({ _id: { $in: conversation.messages } }, { $set: { isDeleted: true } });
    }
    conversation.messages = [];
    yield conversation.save();
    res
        .status(200)
        .json({
        status: true,
        message: "message cleared successfully",
        conversation,
    });
});
exports.ClearChat = ClearChat;
const DeleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId } = req.params;
        const conversation = yield MessageSchema_1.Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!conversation) {
            throw new errorHandler_1.CustomError("Conversation not found", 404);
        }
        yield MessageSchema_1.Message.deleteMany({ _id: { $in: conversation.messages } });
        yield MessageSchema_1.Conversation.deleteOne({ _id: conversation._id });
        res.status(200).json({ status: true, message: "Conversation deleted" });
    }
    catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
exports.DeleteConversation = DeleteConversation;
