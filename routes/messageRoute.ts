import express from 'express'
import { userAuthMiddleware } from '../middleware/userauthantication'
import { AllCommunities, createCommunity, GetConversation, joinCommunity, SendMessage } from '../Controller/messsageController/message'
import { errorCatch } from '../middleware/tryCatch'

const messageRoute=express.Router()

messageRoute

.post("/create", userAuthMiddleware,errorCatch(createCommunity))
.get("/all",errorCatch(AllCommunities))
.patch("/join/:id",userAuthMiddleware,joinCommunity)
.post('/send/:senderId/:receiverId',SendMessage)
.get('/conversation/:senderId/:receiverId', GetConversation)


export {messageRoute}