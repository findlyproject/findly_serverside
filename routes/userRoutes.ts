import express from "express";
import { EmailUs } from "../Controller/ContactUs";
import { errorCatch } from "../middleware/tryCatch";
import { userAuthMiddleware } from "../middleware/userauthantication";
import { reportuser } from "../Controller/reportController/user";
import { refreshAccessToken, resetPasword, sendOtp } from "../Controller/authController/user";
import { generateSignedUrl } from "../Utils/fileUpload";
import ressumeupload from '../middleware/ressumeUploading'
import { validateData } from "../middleware/zodValidation";
import { IdSchema, LoginSchema, ReportSchema, UserSchema } from "../Utils/zodSchema";
import { AllUsersEmailCheck, googleauthlogin, login, logout, RegistrationUser } from "../Controller/authController/user";
import { findCurrentUserDetails, getPeopleYouMightKnow, getUploadedFiles, removeResumeFile, spacificuserdetails, updateUserProfile, uploadResume } from "../Controller/userController/user";

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
.post("/resetpasword/:email/:password", errorCatch(resetPasword))
.post("/sendotp/:email", errorCatch(sendOtp))


.get("/spacificuserdetails/:id", userAuthMiddleware,validateData(IdSchema), errorCatch(spacificuserdetails))

export {userRouter}