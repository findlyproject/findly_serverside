import express from 'express'
import { userAuthMiddleware } from '../middleware/userauthantication'
import { AllCommunities, communitymesgById, CommunitySendMessage, createCommunity, deletecommunitymessage, GetConversation, joinCommunity, SendMessage } from '../Controller/messsageController/message'
import { errorCatch } from '../middleware/tryCatch'

const messageRoute=express.Router()

messageRoute

.post("/create", userAuthMiddleware,errorCatch(createCommunity))
.get("/all",errorCatch(AllCommunities))
.patch("/join/:id",userAuthMiddleware,errorCatch(joinCommunity))
.post('/send/:senderId/:receiverId',userAuthMiddleware,errorCatch(SendMessage))
.get('/conversation/:senderId/:receiverId', GetConversation)
.post('/communtyMessage/:id',userAuthMiddleware,errorCatch(CommunitySendMessage))
.get('/getCommuntyMessage/:id',userAuthMiddleware,errorCatch(communitymesgById))
.post('/deletCommuntyMessage/:id',userAuthMiddleware,errorCatch(deletecommunitymessage))


export {messageRoute}