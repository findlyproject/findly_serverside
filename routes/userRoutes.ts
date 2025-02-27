import express from "express";
import { EmailUs } from "../Controller/ContactUs";
import { errorCatch } from "../middleware/tryCatch";
import { userAuth, userAuthMiddleware } from "../middleware/userauthantication";
import { reportuser } from "../Controller/reportController/user";
import { findUsers, refreshAccessToken, resetPasword, sendOtp } from "../Controller/authController/user";
import { generateSignedUrl } from "../Utils/fileUpload";
import ressumeupload from '../middleware/ressumeUploading'
import { validateData } from "../middleware/zodValidation";
import { IdSchema, LoginSchema, ReportSchema, SubscriptionSchema, UserSchema, VerificationSchema } from "../Utils/zodSchema";
import { AllUsersEmailCheck, googleauthlogin, login, logout, RegistrationUser } from "../Controller/authController/user";
import { findCurrentUserDetails, getPeopleYouMightKnow, getPrimeClients, getTotalRevenue, getUploadedFiles, removeResumeFile, spacificuserdetails, updateUserProfile, uploadResume } from "../Controller/userController/user";
import { applyToJob } from "../Controller/jobController/user";
import { createSubscription, findSubscriptionById, verifySubscription } from "../Controller/subscriptionController/user";
<<<<<<< HEAD
import { createCompanyRating, deleteReview } from "../Controller/ratingController/user";
=======
import { createCompanyRating } from "../Controller/ratingController/user";
>>>>>>> e6501b5a2aa3b6fb5f90a34c361dedf35e68053d
import { findreviewsByTargetedId } from "../Controller/ratingController/company";

const userRouter = express.Router()

userRouter

//auth
.post("/registration",validateData(UserSchema),errorCatch(RegistrationUser))
.post("/login",validateData(LoginSchema),errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin)) 
.post("/logout",errorCatch(logout))
.post("/refreshtoken",errorCatch(refreshAccessToken))

.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))

//user
.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))
.put("/profile",userAuthMiddleware,validateData(UserSchema),errorCatch(updateUserProfile))

.post("/uploadressume",userAuthMiddleware,ressumeupload,errorCatch(uploadResume))
.get("/getuploadedfiles",userAuthMiddleware,errorCatch(getUploadedFiles))
.delete("/removeresume", userAuthMiddleware, errorCatch(removeResumeFile))


.get('/all',AllUsersEmailCheck)

.post("/reportuser",userAuthMiddleware,validateData(ReportSchema),errorCatch(reportuser))
.get("/generate-signed-url", errorCatch(generateSignedUrl))

.get("/spacificuserdetails/:id", userAuthMiddleware, errorCatch(spacificuserdetails))

.post("/resetpasword/:email/:password", errorCatch(resetPasword))
.post("/sendotp/:email", errorCatch(sendOtp))
<<<<<<< HEAD
.delete("/deletereview/:id",userAuth,errorCatch(deleteReview))
=======

.get("/findrating/:targetedId",userAuth,errorCatch(findreviewsByTargetedId))
>>>>>>> e6501b5a2aa3b6fb5f90a34c361dedf35e68053d




//apply job
.post("/applytojob/:jobId", userAuthMiddleware, ressumeupload, errorCatch(applyToJob))
.get("/allusers",errorCatch(findUsers))
.get("/getTotalRevenue",errorCatch(getTotalRevenue))
.get("/findprimeclients",errorCatch(getPrimeClients))
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
export {userRouter} 