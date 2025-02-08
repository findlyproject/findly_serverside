import  express from "express";
import { userAuthMiddleware } from "../../Middleware/userauthantication";
import { errorCatch } from "../../Middleware/tryCatch";
import { createSubscription, findSubscriptionById, verifySubscription } from "../../Controller/commonFolders/subscriptionControllers/createPaymentIntent";
const paymentRouter=express.Router()

paymentRouter

.post("/createSubscription",userAuthMiddleware,errorCatch(createSubscription))
.post("/verifySubscription/:sessionId",userAuthMiddleware,errorCatch(verifySubscription))
.post("/findsubscriptionbyId/:sessionId",userAuthMiddleware,errorCatch(findSubscriptionById))



export {paymentRouter}


