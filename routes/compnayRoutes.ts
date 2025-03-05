import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { initialRegister,verifyOTP,finalRegister,login, logOut, resetPasword, requestDeleteAccount, verifyOtp, } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CommentSchema, CompanySchema, IdSchema, jobPostSchema, LoginSchema, SubscriptionSchema, VerificationSchema } from "../Utils/zodSchema";
import { approveJobApplication, createJobPost, deleteJobPost, findAppliedUsers, findUserApplication, getAllJobPost, getJobsByCompanies, getJobsById, rejectJobApplication, updateJobPost } from "../Controller/jobController/company";
import { companyAuth, userAuthMiddleware } from "../middleware/userauthantication";
import { sendOtp } from "../Controller/authController/company";
import { createSubscription, findSubscriptionById, verifySubscription } from "../Controller/subscriptionController/user";
import { allCompanies } from "../Controller/userController/admin";

import { FollowAndUnfollowCompany } from "../Controller/ConnectingController/user";

import { spacificCompanyDetails } from "../Controller/userController/company";
import { createCompanyRating } from "../Controller/ratingController/user";




import { deleteReview, deleteReviews, findreviewsBycompany, findreviewsByTargetedId } from "../Controller/ratingController/company";
import { addCommentToPost, deleteComment, editComment, getCommentById } from "../Controller/commentController/user";

const companyRouter = express.Router();

companyRouter

  //auth
    
  .post(
    "/send-otp",
    errorCatch(initialRegister)
  )
  .post(
    "/verify-otp",
    errorCatch(verifyOTP)
  )
  .post(
    "/final-register",
    upload.single("logo"),
    validateData(CompanySchema),
    errorCatch(finalRegister)
  )
  .post("/login",validateData(LoginSchema),errorCatch(login))
  .post("/logout",companyAuth, errorCatch(logOut))
  .post("/jobposting",companyAuth,validateData(jobPostSchema),errorCatch(createJobPost))
  .patch("/updatejobs/:jobId",companyAuth,errorCatch(updateJobPost))
  .delete("/deletejobpost/:jobId",companyAuth,errorCatch(deleteJobPost))
  .get("/getalljobs",userAuthMiddleware,errorCatch(getAllJobPost))
  .get("/getJobsById/:id",userAuthMiddleware,errorCatch(getJobsById))
  .get("/findapplications",companyAuth,errorCatch(findAppliedUsers))
  .get("/findapplications/:userId/:jobId",companyAuth,errorCatch(findUserApplication))
  .put("/reject-application/:userId/:jobId", companyAuth, errorCatch(rejectJobApplication))
  .put("/approve/:userId/:jobId", companyAuth,errorCatch(approveJobApplication))
  .post("/sendotp/:email",errorCatch(sendOtp))
  .post("/resetpassword/:email/:password",errorCatch(resetPasword))
  .get("/allcompanies",errorCatch(allCompanies))
  .get("/findcompany/:companyId",errorCatch(spacificCompanyDetails))
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
      .get(
        "/payment/findsubscriptionbyId/:sessionId",
        companyAuth,
        validateData(undefined, VerificationSchema),
        errorCatch(findSubscriptionById)
      )
      .get("/getjobs",companyAuth,errorCatch(getJobsByCompanies))
      .post("/companyrating/:targetedId",companyAuth,errorCatch(createCompanyRating))
      .delete("/deletereview/:id",companyAuth,errorCatch(deleteReview))
      .delete("/deleteReview/:id",companyAuth,errorCatch(deleteReviews))
      .get("/findrating/:targetedId",companyAuth,errorCatch(findreviewsByTargetedId))



      .post(`/follow/:id`,userAuthMiddleware,errorCatch(FollowAndUnfollowCompany))


.get(
    "/viewcomment/:id",
    companyAuth,
    errorCatch(getCommentById)
  )
  .post(
    "/comment",
    companyAuth,
    validateData(CommentSchema),
    errorCatch(addCommentToPost)
  )
  .put(
    "/edit-comment/:commentId",
    companyAuth,
    errorCatch(editComment)
  )
  .post(
    "/delete-comment/:commentId",
    companyAuth,
    errorCatch(deleteComment)
  )

      //delete account
      .post("/accountdeletionreqst",companyAuth,errorCatch(requestDeleteAccount))
      .post("/verifyOtp",companyAuth,errorCatch(verifyOtp))

export { companyRouter };
