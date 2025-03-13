import express from "express";
import { EmailUs } from "../Controller/ContactUs";
import { errorCatch } from "../middleware/tryCatch";
import { userAuth, userAuthMiddleware } from "../middleware/userauthantication";
import { reportuser } from "../Controller/reportController/user";
import { findUsers, refreshAccessToken, requestDeleteAccount, resetPasword, sendOtp, verifyOtp } from "../Controller/authController/user";
import { generateSignedUrl } from "../Utils/fileUpload";
import ressumeupload from '../middleware/ressumeUploading'
import { validateData } from "../middleware/zodValidation";
import { CommentSchema, IdSchema, LoginSchema, ReplySchema, ReportSchema, SubscriptionSchema, UserSchema, VerificationSchema } from "../Utils/zodSchema";
import { AllUsersEmailCheck, googleauthlogin, login, logout, RegistrationUser } from "../Controller/authController/user";
import { findCurrentUserDetails, getPeopleYouMightKnow, getPrimeClients, getTotalRevenue, getUploadedFiles, removeResumeFile, spacificuserdetails, updateUserProfile, uploadResume } from "../Controller/userController/user";
import { applydeJobs, applyToJob, getRecommendedJobs, getsavedjobs, saveJobs, similarjobs } from "../Controller/jobController/user";
import { createSubscription, findSubscriptionById, verifySubscription } from "../Controller/subscriptionController/user";
import { createCompanyRating, deleteReview } from "../Controller/ratingController/user";
import { findreviewsByTargetedId } from "../Controller/ratingController/company";
import { addCommentToPost, deleteComment, editComment, getAllComments, getCommentById } from "../Controller/commentController/user";
import { deleteReply, editReply, getCommentsWithReplies, getRepliesForComment, replyToComment } from "../Controller/replyController/user";
import { LikeOrDislike } from "../Controller/postController/user";
import { All, AllSaved, SaveandUnsavePost } from "../Controller/saveController/user";

const userRouter = express.Router()

userRouter

//auth
.post("/registration",validateData(UserSchema),errorCatch(RegistrationUser))
.post("/login",validateData(LoginSchema),errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin)) 
.post("/logout",errorCatch(logout))
.post("/refreshtoken",errorCatch(refreshAccessToken))

.post("/emailus",errorCatch(EmailUs))
   




//user
.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))
.put("/profile",userAuthMiddleware,validateData(UserSchema),errorCatch(updateUserProfile))

.post("/uploadressume",userAuthMiddleware,ressumeupload,errorCatch(uploadResume))
.get("/getuploadedfiles",userAuthMiddleware,errorCatch(getUploadedFiles))
.delete("/removeresume", userAuthMiddleware, errorCatch(removeResumeFile))

.post("/save/:id",userAuth,errorCatch(SaveandUnsavePost))
.get("/saveds",userAuth,errorCatch(AllSaved))
.get("/all",userAuth,errorCatch(All))








.get('/all',AllUsersEmailCheck)

.post("/reportuser",userAuthMiddleware,validateData(ReportSchema),errorCatch(reportuser))
.get("/generate-signed-url", errorCatch(generateSignedUrl))

.get("/spacificuserdetails/:id", userAuthMiddleware, errorCatch(spacificuserdetails))

.post("/resetpasword/:email/:password", errorCatch(resetPasword))
.post("/sendotp/:email", errorCatch(sendOtp))

.get("/findrating/:targetedId",userAuth,errorCatch(findreviewsByTargetedId))




//apply job
.post("/applytojob/:jobId", userAuth, ressumeupload, errorCatch(applyToJob))
.get("/applyedjobs", userAuth, errorCatch(applydeJobs))
.get("/allusers",errorCatch(findUsers))
.get("/getTotalRevenue",errorCatch(getTotalRevenue))
.get("/findprimeclients",errorCatch(getPrimeClients))
.post("/saveJobs/:id",userAuth,errorCatch(saveJobs))
.get("/getsavedjobs", userAuth, errorCatch(getsavedjobs))
.get("/recommended",userAuth, errorCatch(getRecommendedJobs))
.post(
    "/payment/createSubscription",
    userAuth,
    validateData(SubscriptionSchema),
    errorCatch(createSubscription)
  )
  .post(
      "/payment/verifySubscription/:sessionId",
      userAuth,
      validateData(undefined, VerificationSchema),
      errorCatch(verifySubscription)
    )  
    .post(
      "/payment/findsubscriptionbyId/:sessionId",
      userAuth,
      validateData(undefined, VerificationSchema),
      errorCatch(findSubscriptionById)
    )

    .post("/companyrating/:targetedId",userAuth,errorCatch(createCompanyRating))
   
    .get("/findrating/:targetedId",userAuth,errorCatch(findreviewsByTargetedId))
    .post("/accountdeletionreqst",userAuth,errorCatch(requestDeleteAccount))
    .post("/verifyOtp",userAuth,errorCatch(verifyOtp))



    .get("/similarjobs/:jobType/:companyName",userAuth,errorCatch(similarjobs))

     //comment
      .get("/allcomments", errorCatch(getAllComments))
      .get(
        "/viewcomment/:id",
        userAuth,
        errorCatch(getCommentById)
      )
      .post(
        "/comment",
        userAuth,
        validateData(CommentSchema),
        errorCatch(addCommentToPost)
      )
      .put(
        "/edit-comment/:commentId",
        userAuth,
        errorCatch(editComment)
      )
      .post(
        "/delete-comment/:commentId",
        userAuth,
        errorCatch(deleteComment)
      )

      //like & unlike
        .post(
          "/likepost/:id",
          userAuth,
          errorCatch(LikeOrDislike)
        )
      
       
      
        //reply
        .post(
          "/postreplay",
          userAuth,
          validateData(ReplySchema),
          errorCatch(replyToComment)
        )
        .get(
          "/findreply/:commentId",
          userAuth,
          errorCatch(getRepliesForComment)
        )
        .put("/editreplay", userAuth, errorCatch(editReply))
        .delete("/deletereplay", userAuth, errorCatch(deleteReply))
        .get(
          "/getcommentswithreplies",
          userAuth,
          errorCatch(getCommentsWithReplies)
        )
export {userRouter} 