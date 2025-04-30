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
exports.FollowAndUnfollowCompany = exports.ignoreConnectionRequest = exports.GetConnectionRequest = exports.removeConnection = exports.getconnection = exports.acceptconnectionrequest = exports.userconnections = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
const CompanySchema_1 = require("../../model/CompanySchema");
//CONNECTION REQUEST
const userconnections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const connectionId = req.params.id;
    if (!_id) {
        throw new errorHandler_1.CustomError("User ID is missing", 404);
    }
    if (!connectionId) {
        throw new errorHandler_1.CustomError("Invalid connection ID format", 404);
    }
    const currentUser = yield UserSchema_1.default.findById(_id);
    if (!currentUser) {
        throw new errorHandler_1.CustomError("Current user not found", 404);
    }
    const targetUser = yield UserSchema_1.default.findById(connectionId);
    if (!targetUser) {
        throw new errorHandler_1.CustomError("Target user not found", 404);
    }
    const isDuplicate = targetUser.connecting.some((conn) => { var _a; return ((_a = conn.connectionID) === null || _a === void 0 ? void 0 : _a.toString()) === _id; });
    if (isDuplicate) {
        throw new errorHandler_1.CustomError("Connection request already sent", 404);
    }
    targetUser.connecting.push({
        connectionID: new mongoose_1.default.Types.ObjectId(_id),
        status: false,
        createdAt: new Date(),
    });
    yield targetUser.save();
    const populatedTargetUser = yield UserSchema_1.default.findById(connectionId).populate("connecting.connectionID", "name email profilePic");
    res.status(200).json({
        status: true,
        message: "Connection request sent successfully",
        targetUser: populatedTargetUser,
    });
});
exports.userconnections = userconnections;
//REQUEST ACCEPT
const acceptconnectionrequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const connectionId = req.params.id;
    if (!_id) {
        throw new errorHandler_1.CustomError("User ID is missing", 404);
    }
    if (!connectionId) {
        throw new errorHandler_1.CustomError("Invalid connection ID format", 404);
    }
    const targetUser = yield UserSchema_1.default.findById(_id);
    if (!targetUser) {
        throw new errorHandler_1.CustomError("Target user not found", 404);
    }
    const requestingUser = yield UserSchema_1.default.findById(connectionId);
    if (!requestingUser) {
        throw new errorHandler_1.CustomError("Requesting user not found", 404);
    }
    const connectionIndex = targetUser.connecting.findIndex((conn) => { var _a; return ((_a = conn.connectionID) === null || _a === void 0 ? void 0 : _a.toString()) === connectionId; });
    if (connectionIndex === -1) {
        throw new errorHandler_1.CustomError("No pending connection request found", 404);
    }
    targetUser.connecting[connectionIndex].status = true;
    requestingUser.connecting.push({
        connectionID: new mongoose_1.default.Types.ObjectId(_id),
        status: true,
        createdAt: new Date(),
    });
    yield targetUser.save();
    yield requestingUser.save();
    res.status(200).json({
        status: true,
        message: "Connection request accepted successfully",
        targetUser,
        requestingUser,
    });
});
exports.acceptconnectionrequest = acceptconnectionrequest;
//////////////////////////////// GET CONNECTION OF CURRENT USER /////////////////////
const getconnection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!_id) {
        throw new errorHandler_1.CustomError("User ID is missing", 404);
    }
    const foundUser = yield UserSchema_1.default.findOne({ _id }).populate({
        path: "connecting.connectionID",
        select: "firstName lastName email profileImage jobTitle connecting",
    });
    if (!foundUser) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const userConnections = foundUser.connecting.filter((conn) => conn.status === true);
    res.status(200).json({
        status: true,
        message: "User connections retrieved successfully",
        connections: userConnections,
    });
});
exports.getconnection = getconnection;
////////////// CONNECTION REMOVING /////////////
const removeConnection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const connectionId = req.params.id;
    if (!connectionId) {
        throw new errorHandler_1.CustomError("Invalid connection ID format", 404);
    }
    const user = yield UserSchema_1.default.findById(_id);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const findConnectedUser = yield UserSchema_1.default.findOne({ _id: connectionId });
    if (!findConnectedUser) {
        throw new errorHandler_1.CustomError("Connected user not found", 404);
    }
    const userobjectid = new mongoose_1.default.Types.ObjectId(_id);
    const connectedIDobject = new mongoose_1.default.Types.ObjectId(connectionId);
    const finduserconnection = user.connecting.find((item) => item.connectionID.equals(connectedIDobject));
    if (!finduserconnection) {
        throw new errorHandler_1.CustomError("User connection not found", 404);
    }
    const filteredconnections = findConnectedUser.connecting.filter((item) => item.connectionID.equals(userobjectid));
    if (!filteredconnections) {
        throw new errorHandler_1.CustomError("Connected user connection not found", 404);
    }
    user.connecting = user.connecting.filter((item) => !item.connectionID.equals(connectedIDobject));
    findConnectedUser.connecting = findConnectedUser.connecting.filter((item) => !item.connectionID.equals(userobjectid));
    yield user.save();
    yield findConnectedUser.save();
    res
        .status(200)
        .json({ status: true, message: "Connection removed successfully", user });
    return;
});
exports.removeConnection = removeConnection;
//ALL CONNECTION REQUEST OF A USER
const GetConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId)
        .select("connecting")
        .populate("connecting.connectionID");
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const pendingRequests = user.connecting.filter((conn) => conn.status === false);
    res.status(200).json({
        success: true,
        message: "Pending connection requests fetched successfully",
        requests: pendingRequests,
    });
});
exports.GetConnectionRequest = GetConnectionRequest;
//IGNORE CONNECTION REQUEST
const ignoreConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const connectionId = req.params.id;
    if (!_id) {
        throw new errorHandler_1.CustomError("User ID is missing", 404);
    }
    if (!connectionId) {
        throw new errorHandler_1.CustomError("Invalid connection ID format", 404);
    }
    const currentUser = yield UserSchema_1.default.findById(_id);
    if (!currentUser) {
        throw new errorHandler_1.CustomError("Current user not found", 404);
    }
    const updatedConnections = currentUser.connecting.filter((conn) => { var _a; return ((_a = conn.connectionID) === null || _a === void 0 ? void 0 : _a.toString()) !== connectionId; });
    if (updatedConnections.length === currentUser.connecting.length) {
        throw new errorHandler_1.CustomError("Connection request not found", 404);
    }
    currentUser.connecting = updatedConnections;
    yield currentUser.save();
    res
        .status(200)
        .json({ status: true, message: "Connection request ignored successfully" });
});
exports.ignoreConnectionRequest = ignoreConnectionRequest;
const FollowAndUnfollowCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assumes authentication middleware is setting user ID
    const companyId = req.params.id;
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
    }
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const isFollowing = user.following.some((id) => id.toString() === companyId);
    if (isFollowing) {
        user.following = user.following.filter((id) => id.toString() !== companyId);
        company.followers = company.followers.filter((id) => id.toString() !== userId);
        yield user.save();
        yield company.save();
        res.status(200).json({ message: "Company unfollowed successfully", following: user.following });
    }
    else {
        user.following.push(new mongoose_1.default.Types.ObjectId(companyId));
        company.followers.push(new mongoose_1.default.Types.ObjectId(userId));
        yield user.save();
        yield company.save();
        res.status(200).json({ message: "Company followed successfully", following: user.following, company });
    }
});
exports.FollowAndUnfollowCompany = FollowAndUnfollowCompany;
