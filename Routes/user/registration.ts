import express from "express";
import { findCurrentUserDetails, googleauthlogin, login, logout, RegistrationUser,updateUserProfile,getPeopleYouMightKnow,AllUsersEmailCheck ,AllUsers, spacificuserdetails} from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../middleware/tryCatch";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import {upload} from '../../middleware/upload'
import { reportuser } from "../../Controller/User/getotheruserdetails";
import ressumeupload from '../../middleware/ressumeUploading'
const router = express.Router()

router
.post("/registration", errorCatch(RegistrationUser))
.post("/login",errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin))

.post("/logout",errorCatch(logout))
.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))

.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))

// .post("/uploadressume",userAuthMiddleware,ressumeupload,errorCatch(uploadResume))
// .delete("/removeresume", userAuthMiddleware, errorCatch(removeResumeFile))

.put( 
    "/profile",
    userAuthMiddleware,
    upload.fields([
      { name: "profileImage", maxCount: 1 },   
      { name: "banner", maxCount: 1 },
    ]),
    errorCatch(updateUserProfile) 
  )
.get('/all',AllUsersEmailCheck)
.get('/users',AllUsers)
.post("/reportuser",userAuthMiddleware,errorCatch(reportuser))
.get("/spacificuserdetails/:id", userAuthMiddleware, errorCatch(spacificuserdetails))

export {router}