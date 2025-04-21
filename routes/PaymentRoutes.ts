import express from "express";
import { userAuthMiddleware } from "../middleware/userauthantication";
import { errorCatch } from "../middleware/tryCatch";
import {
  createSubscription,
  findSubscriptionById,
  verifySubscription,
} from "../Controller/subscriptionController/user";
import { SubscriptionSchema, VerificationSchema } from "../Utils/zodSchema";
import { validateData } from "../middleware/zodValidation";
const paymentRouter = express.Router();

paymentRouter

  .post(
    "/createSubscription", 
    userAuthMiddleware,
    validateData(SubscriptionSchema),
    errorCatch(createSubscription)
  )
  .post(
    "/verifySubscription/:sessionId",
    userAuthMiddleware,
    validateData(undefined, VerificationSchema),
    errorCatch(verifySubscription)
  )  
  .post(
    "/findsubscriptionbyId/:sessionId",
    userAuthMiddleware,
    validateData(undefined, VerificationSchema),
    errorCatch(findSubscriptionById)
  )


  // .get("/subscriptiondetails",userAuthMiddleware,errorCatch(PremiumDetailsOfActiveUser))
export { paymentRouter };
