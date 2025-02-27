import express from "express";

import { SendMessage } from "../Controller/messageController/message";
import { GetConversation } from "../Controller/messageController/message";
import { errorCatch } from "../middleware/tryCatch";
import { AllCommunities, createCommunity,joinCommunity } from "../Controller/messageController/community";
import { userAuthMiddleware } from "../middleware/userauthantication";
const messageRouter = express.Router();

messageRouter
.post('/send/:senderId/:receiverId',SendMessage)
.get('/conversation/:senderId/:receiverId', GetConversation)



  export default messageRouter;