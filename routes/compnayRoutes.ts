import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { initialRegister,verifyOTP,finalRegister,login, logOut, resetPasword, } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CompanySchema, jobPostSchema, LoginSchema, SubscriptionSchema, VerificationSchema } from "../Utils/zodSchema";
import { companyAuthMiddleware } from "../middleware/companyAuthentication";
import { createJobPost, deleteJobPost, findAppliedUsers, findUserApplication, getAllJobPost, getJobsByCompanies, getJobsById, updateJobPost } from "../Controller/jobController/company";
import { companyAuth, userAuthMiddleware } from "../middleware/userauthantication";
import { sendOtp } from "../Controller/authController/company";
import { createSubscription, findSubscriptionById, verifySubscription } from "../Controller/subscriptionController/user";
import { allCompanies } from "../Controller/userController/admin";
import { FollowAndUnfollowCompany } from "../Controller/ConnectingController/user";
const companyRouter = express.Router();

companyRouter

  //auth
    
  .post(
    "/send-otp",
    // validateData(CompanySchema),
    errorCatch(initialRegister)
  )
  .post(
    "/verify-otp",
    errorCatch(verifyOTP)
  )
  .post(
    "/final-register",
    // validateData(CompanySchema),
    upload.single("logo"),
    errorCatch(finalRegister)
  )
  .post("/login",validateData(LoginSchema),errorCatch(login))
  .post("/logout",companyAuth, errorCatch(logOut))
  .post("/jobposting",companyAuth,validateData(jobPostSchema),errorCatch(createJobPost))
  .patch("/updatejobs/:jobId",companyAuthMiddleware,errorCatch(updateJobPost))
  .delete("/deletejobpost/:jobId",companyAuthMiddleware,errorCatch(deleteJobPost))
  .get("/getalljobs",userAuthMiddleware,errorCatch(getAllJobPost))
  .get("/getJobsById/:id",userAuthMiddleware,errorCatch(getJobsById))
  .get("/findapplications",companyAuth,errorCatch(findAppliedUsers))
  .get("/findapplications/:userId/:jobId",companyAuthMiddleware,errorCatch(findUserApplication))
  .post("/sendotp/:email",errorCatch(sendOtp))
  .post("/resetpassword/:email/:password",errorCatch(resetPasword))
  .get("/allcompanies",errorCatch(allCompanies))
  .post(
      "/payment/createSubscription",
      companyAuth,
      validateData(SubscriptionSchema),
      errorCatch(createSubscription)
    )
    .post(
        "/payment/verifySubscription/:sessionId",
        companyAuth,
        validateData(undefined, VerificationSchema),
        errorCatch(verifySubscription)
      )  
      .post(
        "/payment/findsubscriptionbyId/:sessionId",
        companyAuth,
        validateData(undefined, VerificationSchema),
        errorCatch(findSubscriptionById)
      )
      .get("/getjobs",companyAuth,errorCatch(getJobsByCompanies))




      .post(`/follow/:id`,userAuthMiddleware,errorCatch(FollowAndUnfollowCompany))
export { companyRouter };
