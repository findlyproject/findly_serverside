import express from 'express'
import { userAuthMiddleware } from '../middleware/userauthantication'
import { errorCatch } from '../middleware/tryCatch'
import { createCommunity,AllCommunities ,joinCommunity} from '../Controller/messageController/community'
const communityRouter=express.Router()

communityRouter

.post(`/create`, userAuthMiddleware,     errorCatch(createCommunity))
.get(`/all`,errorCatch(AllCommunities))
.patch(`/join/:id`,userAuthMiddleware,joinCommunity)
export {communityRouter}