import express from 'express'
import { userAuthMiddleware } from '../middleware/userauthantication'
import { AllCommunities, CommunityDetails, createCommunity, GetConversation, joinCommunity, LeaveCommunity, SearchCommunity, SendMessage } from '../Controller/messsageController/message'
import { errorCatch } from '../middleware/tryCatch'

const messageRoute=express.Router()

messageRoute

//community
.post("/create", userAuthMiddleware,errorCatch(createCommunity))
.get("/all",errorCatch(AllCommunities))
.get("/details/:id",errorCatch(CommunityDetails))
.patch("/join/:id",userAuthMiddleware,joinCommunity)
.get(`/search`,SearchCommunity)
.patch(`/leave/:id`,userAuthMiddleware,errorCatch(LeaveCommunity))

.post('/send/:senderId/:receiverId',SendMessage)
.get('/conversation/:senderId/:receiverId', GetConversation)


export {messageRoute}