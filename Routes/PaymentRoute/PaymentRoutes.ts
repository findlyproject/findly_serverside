import  express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { createSubscription, findSubscriptionById, verifySubscription } from "../../Controller/commonFolders/subscriptionControllers/createPaymentIntent";
const paymentRouter=express.Router()

paymentRouter

.post("/createSubscription",userAuthMiddleware,errorCatch(createSubscription))
.post("/verifySubscription/:sessionId",userAuthMiddleware,errorCatch(verifySubscription))
.post("/findsubscriptionbyId/:sessionId",userAuthMiddleware,errorCatch(findSubscriptionById))



export {paymentRouter}


