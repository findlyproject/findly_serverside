"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoute = void 0;
const upload_1 = require("../middleware/upload");
const express_1 = __importDefault(require("express"));
const userauthantication_1 = require("../middleware/userauthantication");
const message_1 = require("../Controller/messsageController/message");
const tryCatch_1 = require("../middleware/tryCatch");
const messageRoute = express_1.default.Router();
exports.messageRoute = messageRoute;
messageRoute
    //community
    .post("/create", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.createCommunity))
    .get("/all", (0, tryCatch_1.errorCatch)(message_1.AllCommunities))
    .get("/details/:id", (0, tryCatch_1.errorCatch)(message_1.CommunityDetails))
    .patch("/join/:id", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.joinCommunity))
    .get(`/search`, message_1.SearchCommunity)
    .patch(`/leave/:id`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.LeaveCommunity))
    .patch(`/update/:id`, userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.UpdateDescriptionCommunity))
    .patch(`/updatename/:id`, userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.UpdateNameCommunity))
    .patch(`/updateprofile/:id`, userauthantication_1.companyAuth, upload_1.upload.single('profile'), (0, tryCatch_1.errorCatch)(message_1.ProfileOfCommunity))
    .patch(`/delete/:id`, userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.DeleteCommunity))
    .post('/communtyMessage/:id', userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.CommunitySendMessage))
    .get('/getCommuntyMessage/:id', userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.communitymesgById))
    .post('/deletCommuntyMessage/:id', userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.deletecommunitymessage))
    .post('/send/:senderId/:receiverId', userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.SendMessage))
    .get('/conversation/:senderId/:receiverId', userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.GetConversation))
    .post(`/blockOrunblock/:senderId/:receiverId`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.BlockOrUnblockUser))
    .post(`/starOrRemovestar/:senderId/:receiverId`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.StarOrRemoveStar))
    .get(`/starred`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.getStarredUsers))
    .get(`/chatlist`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(message_1.GetChatList))
    .get(`/conversations/:senderId/:receiverId`, (0, tryCatch_1.errorCatch)(message_1.Conversations))
    .patch(`/clearchat/:senderId/:receiverId`, (0, tryCatch_1.errorCatch)(message_1.ClearChat))
    .delete(`/deleteconversation/:senderId/:receiverId`, (0, tryCatch_1.errorCatch)(message_1.DeleteConversation));
