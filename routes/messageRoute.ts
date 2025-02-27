import express from 'express'
import { userAuthMiddleware } from '../middleware/userauthantication'
import { AllCommunities, communitymesgById, CommunitySendMessage, CommunityDetails, createCommunity, deletecommunitymessage, GetConversation, joinCommunity, LeaveCommunity, SearchCommunity, SendMessage } from '../Controller/messsageController/message'
import { errorCatch } from '../middleware/tryCatch'

const messageRoute=express.Router()

messageRoute

//community
.post("/create", userAuthMiddleware,errorCatch(createCommunity))
.get("/all",errorCatch(AllCommunities))
.get("/details/:id",errorCatch(CommunityDetails))
.patch("/join/:id",userAuthMiddleware,errorCatch(joinCommunity))
.get(`/search`,SearchCommunity)
.patch(`/leave/:id`,userAuthMiddleware,errorCatch(LeaveCommunity))

.post('/send/:senderId/:receiverId',userAuthMiddleware,errorCatch(SendMessage))
.get('/conversation/:senderId/:receiverId', GetConversation)
.post('/communtyMessage/:id',userAuthMiddleware,errorCatch(CommunitySendMessage))
.get('/getCommuntyMessage/:id',userAuthMiddleware,errorCatch(communitymesgById))
.post('/deletCommuntyMessage/:id',userAuthMiddleware,errorCatch(deletecommunitymessage))


export {messageRoute}