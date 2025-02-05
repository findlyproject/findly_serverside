import express from "express";
import { findCurrentUserDetails, googleauthlogin, login, logout, RegistrationUser,updateUserProfile,getPeopleYouMightKnow,AllUsers, uploadResume } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../middleware/tryCatch";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import {upload} from '../../middleware/upload'
import ressumeupload from '../../middleware/ressumeUploading'
const router = express.Router()

router
.post("/registration", errorCatch(RegistrationUser))
.post("/login",errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin))

.post("/logout",userAuthMiddleware,errorCatch(logout))
.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))

.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))

.post("/uploadressume",userAuthMiddleware,ressumeupload,errorCatch(uploadResume))

.put(
    "/profile",
    userAuthMiddleware,
    upload.fields([
      { name: "profileImage", maxCount: 1 },   
      { name: "banner", maxCount: 1 },
    ]),
    errorCatch(updateUserProfile) 
  )
.get('/all',AllUsers)
export {router}