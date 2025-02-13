import express from "express";
import { findCurrentUserDetails, googleauthlogin, login, logout, RegistrationUser,updateUserProfile,getPeopleYouMightKnow,AllUsersEmailCheck ,AllUsers, spacificuserdetails} from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../middleware/tryCatch";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { reportuser } from "../../Controller/User/getotheruserdetails";
import { refreshAccessToken } from "../../Controller/User/refreshToken";
import { generateSignedUrl } from "../../Utils/fileUpload";
const router = express.Router()

router
.post("/registration", errorCatch(RegistrationUser))
.post("/login",errorCatch(login))
.post("/googleauthlogin",errorCatch(googleauthlogin))

.post("/logout",errorCatch(logout))
.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))

.get("/currentuserdetails",userAuthMiddleware,errorCatch(findCurrentUserDetails))
.get("/people-you-might-know", userAuthMiddleware, errorCatch(getPeopleYouMightKnow))
.put("/profile",userAuthMiddleware,errorCatch(updateUserProfile))
.get('/all',AllUsersEmailCheck)
.get('/users',AllUsers)
.post("/reportuser",userAuthMiddleware,errorCatch(reportuser))
.post("/refreshtoken",errorCatch(refreshAccessToken))
.get("/generate-signed-url", errorCatch(generateSignedUrl))
.get("/spacificuserdetails/:id", userAuthMiddleware, errorCatch(spacificuserdetails))

export {router}