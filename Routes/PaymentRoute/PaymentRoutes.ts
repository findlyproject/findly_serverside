import  express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { createSubscription, verifySubscription } from "../../Controller/commonFolders/subscriptionControllers/createPaymentIntent";
const paymentRouter=express.Router()

paymentRouter

.post("/createSubscription",userAuthMiddleware,errorCatch(createSubscription))
.post("/verifySubscription/:sessionId",userAuthMiddleware,errorCatch(verifySubscription))


export {paymentRouter}


