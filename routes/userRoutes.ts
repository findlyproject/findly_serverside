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
import { findCurrentUserDetails, getPeopleYouMightKnow, getPrimeClients, getTotalRevenue, getUploadedFiles, removeResumeFile, spacificuserdetails, updateBanner, updateBasicInfo, updateOtherDetails, updateProfileImage, uploadResume } from "../Controller/userController/user";
import { applydeJobs, applyToJob, getRecommendedJobs, getsavedjobs, saveJobs, similarjobs } from "../Controller/jobController/user";
import { createSubscription, findSubscriptionById, PremiumDetailsOfActiveUser, verifySubscription } from "../Controller/subscriptionController/user";
import { createCompanyRating, deleteReview } from "../Controller/ratingController/user";
import { findreviewsByTargetedId } from "../Controller/ratingController/company";
import { addCommentToPost, deleteComment, editComment, getAllComments, getCommentById } from "../Controller/commentController/user";
import { deleteReply, editReply, getCommentsWithReplies, getRepliesForComment, replyToComment } from "../Controller/replyController/user";
import { addPost, DeletePost, getLikedPosts, getPostsByOwners, LikeOrDislike, updatePost } from "../Controller/postController/user";
import { AllSaved, SaveandUnsavePost } from "../Controller/saveController/user";
import { upload } from "../middleware/upload";

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
// .put("/profile",userAuthMiddleware,validateData(UserSchema),errorCatch(updateUserProfile))
.put('/update-banner',userAuth,errorCatch(updateBanner))
.put('/update-profile-image',userAuth, errorCatch(updateProfileImage))
.put('/update-basic-info',userAuth,errorCatch(updateBasicInfo))
.put('/update-other-details',userAuth,errorCatch(updateOtherDetails))

.post(
    "/send-otp",
    errorCatch(sendOtp)
  )
  .post(
    "/verify-otp",
    errorCatch(verifyOtp)
  )
.post("/uploadressume",userAuthMiddleware,ressumeupload,errorCatch(uploadResume))
.get("/getuploadedfiles",userAuthMiddleware,errorCatch(getUploadedFiles))
.delete("/removeresume", userAuthMiddleware, errorCatch(removeResumeFile))

.post("/save/:id",userAuth,errorCatch(SaveandUnsavePost))
.get("/saveds",userAuth,errorCatch(AllSaved))
// .get("/all",userAuth,errorCatch(All))








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
    .get(
      "/payment/findsubscriptionbyId/:sessionId",
      userAuth,
      // validateData(undefined, VerificationSchema),
      errorCatch(findSubscriptionById)
    )
    .get("/payment/subscriptiondetails",errorCatch(PremiumDetailsOfActiveUser))
    .post("/companyrating/:targetedId",userAuth,errorCatch(createCompanyRating))
   
    .get("/findrating/:targetedId",userAuth,errorCatch(findreviewsByTargetedId))
    .post("/accountdeletionreqst",userAuth,errorCatch(requestDeleteAccount))
    .post("/verifyOtp",userAuth,errorCatch(verifyOtp))

 .get(
    "/posts",
    userAuth,
    errorCatch(getPostsByOwners)
  )

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
      
        .get(
          "/likes",
          userAuth,
          errorCatch(getLikedPosts)
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
         .post(
            "/upload",
            userAuth,
            upload.fields([{ name: "media", maxCount: 5 }]),
            addPost
          )
          .patch(
            "/update/:postId",
            userAuth,
            upload.fields([{ name: "media", maxCount: 5 }]),
            errorCatch(updatePost)
          )
          .put("/delete/:postId",userAuth, errorCatch(DeletePost))
        
export {userRouter} 