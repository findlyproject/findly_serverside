import express from "express";
import { findCurrentUserDetails, googleauthlogin, login, logout, RegistrationUser,updateUserProfile,getPeopleYouMightKnow,AllUsersEmailCheck ,AllUsers, spacificuserdetails} from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../Middleware/tryCatch";
import { userAuthMiddleware } from "../../Middleware/userauthantication";
import {upload} from '../../Middleware/upload'
import { reportuser } from "../../Controller/User/getotheruserdetails";
const router = express.Router()

router
.post("/registration", errorCatch(RegistrationUser))
.post("/login",errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin))

.post("/logout",userAuthMiddleware,errorCatch(logout))
.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))

.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))
.put(
    "/profile",
    userAuthMiddleware,
    upload.fields([
      { name: "profileImage", maxCount: 1 },   
      { name: "banner", maxCount: 1 },
    ]),
    errorCatch(updateUserProfile) // Make sure errorCatch handles async properly
  )
.get('/all',AllUsersEmailCheck)
.get('/users',AllUsers)
.post("/reportuser",userAuthMiddleware,errorCatch(reportuser))
.get("/spacificuserdetails/:id", userAuthMiddleware, errorCatch(spacificuserdetails))

export {router}